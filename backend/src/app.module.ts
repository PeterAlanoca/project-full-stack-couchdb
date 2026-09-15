import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CouchdbModule, COUCHDB_DATABASE } from './shared/infrastructure/couchdb/couchdb.module.js';
import { ensureIndexes } from './shared/infrastructure/couchdb/couchdb-indexes.js';
import { MoviesModule } from './movies/presentation/movies.module.js';
import { CopiesModule } from './copies/presentation/copies.module.js';
import { CustomersModule } from './customers/presentation/customers.module.js';
import { RentalsModule } from './rentals/presentation/rentals.module.js';
import { ConfigBoundedModule } from './config/presentation/config.module.js';
import { AuthModule } from './auth/presentation/auth.module.js';
import { JwtAuthGuard } from './auth/presentation/guards/jwt-auth.guard.js';
import { SeedAdminUseCase } from './auth/application/use-cases/seed-admin.use-case.js';
import * as nano from 'nano';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CouchdbModule,
    AuthModule,
    MoviesModule,
    CopiesModule,
    CustomersModule,
    RentalsModule,
    ConfigBoundedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(COUCHDB_DATABASE) private readonly db: nano.DocumentScope<any>,
    private readonly seedAdminUseCase: SeedAdminUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    await ensureIndexes(this.db);
    await this.seedAdminUseCase.execute();
  }
}

