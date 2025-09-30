import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { GroupsModule } from './groups/groups.module';
import { SystemsModule } from './systems/systems.module';
import { LoggerModule } from './logging/logger.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { StpsModule } from './stps/stps.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PoamsModule } from './poams/poams.module';
import { TeamsModule } from './teams/teams.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { AdminModule } from './admin/admin.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { CatalogModule } from './catalog/catalog.module';
import { VulnerabilityCenterModule } from './vulnerability-center/vulnerability-center.module';
import { RedisModule } from './redis/redis.module';
import { QueuesModule } from './queues/queues.module';
import { DocumentsModule } from './documents/documents.module';
import { PpsmModule } from './ppsm/ppsm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    PackagesModule,
    GroupsModule,
    SystemsModule,
    StpsModule,
    DashboardModule,
    PoamsModule,
    TeamsModule,
    VulnerabilitiesModule,
    AdminModule,
    CatalogModule,
    VulnerabilityCenterModule,
    FileManagerModule,
    DocumentsModule,
    PpsmModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
