import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { AuthController } from './auth.controller.js';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import { SeedAdminUseCase } from '../application/use-cases/seed-admin.use-case.js';
import { CouchdbAdminRepository } from '../infrastructure/repositories/couchdb-admin.repository.js';
import { ADMIN_REPOSITORY } from '../domain/repositories/admin.repository.interface.js';

@Module({
  imports: [
    CouchdbModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'videoclub_lapaz_jwt_secret_key_2026_super_secure',
        ),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    SeedAdminUseCase,
    { provide: ADMIN_REPOSITORY, useClass: CouchdbAdminRepository },
  ],
  exports: [ADMIN_REPOSITORY, JwtModule, SeedAdminUseCase],
})
export class AuthModule {}
