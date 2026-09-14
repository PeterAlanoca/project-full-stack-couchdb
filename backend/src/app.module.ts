import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CouchdbModule, COUCHDB_DATABASE } from './shared/infrastructure/couchdb/couchdb.module.js';
import { ensureIndexes } from './shared/infrastructure/couchdb/couchdb-indexes.js';
import { MoviesModule } from './movies/presentation/movies.module.js';
import { CopiesModule } from './copies/presentation/copies.module.js';
import { CustomersModule } from './customers/presentation/customers.module.js';
import { RentalsModule } from './rentals/presentation/rentals.module.js';
import { ConfigBoundedModule } from './config/presentation/config.module.js';
import { Inject } from '@nestjs/common';
import * as nano from 'nano';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CouchdbModule,
    MoviesModule,
    CopiesModule,
    CustomersModule,
    RentalsModule,
    ConfigBoundedModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(COUCHDB_DATABASE) private readonly db: nano.DocumentScope<any>,
  ) {}

  async onModuleInit(): Promise<void> {
    await ensureIndexes(this.db);
  }
}
