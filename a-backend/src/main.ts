import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLoggerService } from './logging/logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

const MAX_PAYLOAD_SIZE = '50mb';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 1000; // Increased to align with frontend
const DEFAULT_PORT = 3001;
const DEV_FRONTEND_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Increase payload size limits for large file uploads (e.g., Nessus files)
  app.use(json({ limit: MAX_PAYLOAD_SIZE }));
  app.use(urlencoded({ limit: MAX_PAYLOAD_SIZE, extended: true }));

  // Security middleware
  app.use(helmet());

  // Rate limiting for DOD compliance
  app.use(
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow additional query parameters
      transform: true,
    }),
  );

  // Use custom logger
  app.useLogger(app.get(AppLoggerService));

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || `http://localhost:${DEV_FRONTEND_PORT}`,
    credentials: true,
  });

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port);

  const logger = app.get(AppLoggerService);
  logger.log(`🚀 POAM Tracker Backend started on port ${port}`, 'Bootstrap');
  logger.logSecurityEvent({
    eventType: 'SYSTEM_ERROR', // Using as system startup event
    resource: 'APPLICATION',
    action: 'STARTUP',
    details: { port, environment: process.env.NODE_ENV || 'development' },
  });
}
bootstrap();
