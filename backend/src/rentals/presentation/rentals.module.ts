import { Module } from '@nestjs/common';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { RentalsController } from './controllers/rentals.controller.js';
import { CreateRentalUseCase, PreviewRentalPriceUseCase } from '../application/use-cases/create-rental.use-case.js';
import { ReturnRentalUseCase } from '../application/use-cases/return-rental.use-case.js';
import { CouchdbRentalRepository } from '../infrastructure/repositories/couchdb-rental.repository.js';
import { RENTAL_REPOSITORY } from '../domain/repositories/rental.repository.interface.js';
import { CouchdbCopyRepository } from '../../copies/infrastructure/repositories/couchdb-copy.repository.js';
import { COPY_REPOSITORY } from '../../copies/domain/repositories/copy.repository.interface.js';
import { CouchdbMovieRepository } from '../../movies/infrastructure/repositories/couchdb-movie.repository.js';
import { MOVIE_REPOSITORY } from '../../movies/domain/repositories/movie.repository.interface.js';
import { CouchdbCustomerRepository } from '../../customers/infrastructure/repositories/couchdb-customer.repository.js';
import { CUSTOMER_REPOSITORY } from '../../customers/domain/repositories/customer.repository.interface.js';
import { CouchdbBusinessRulesRepository } from '../../config/infrastructure/repositories/couchdb-business-rules.repository.js';
import { BUSINESS_RULES_REPOSITORY } from '../../config/domain/repositories/business-rules.repository.interface.js';

@Module({
  imports: [CouchdbModule],
  controllers: [RentalsController],
  providers: [
    CreateRentalUseCase,
    PreviewRentalPriceUseCase,
    ReturnRentalUseCase,
    { provide: RENTAL_REPOSITORY, useClass: CouchdbRentalRepository },
    { provide: COPY_REPOSITORY, useClass: CouchdbCopyRepository },
    { provide: MOVIE_REPOSITORY, useClass: CouchdbMovieRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: CouchdbCustomerRepository },
    { provide: BUSINESS_RULES_REPOSITORY, useClass: CouchdbBusinessRulesRepository },
  ],
})
export class RentalsModule {}
