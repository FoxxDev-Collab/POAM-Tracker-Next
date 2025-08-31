import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLoggerService } from './logging/logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Security middleware
  app.use(helmet());
  
  // Rate limiting for DOD compliance
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Use custom logger
  app.useLogger(app.get(AppLoggerService));
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  const logger = app.get(AppLoggerService);
  logger.log(`🚀 POAM Tracker Backend started on port ${port}`, 'Bootstrap');
  logger.logSecurityEvent({
    eventType: 'SYSTEM_ERROR', // Using as system startup event
    resource: 'APPLICATION',
    action: 'STARTUP',
    details: { port, environment: process.env.NODE_ENV || 'development' }
  });
}
bootstrap();
