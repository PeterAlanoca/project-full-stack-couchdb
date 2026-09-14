import { Module } from '@nestjs/common';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { CustomersController } from './controllers/customers.controller.js';
import {
  RegisterCustomerUseCase, UpdateCustomerUseCase,
  BlockCustomerUseCase, UnblockCustomerUseCase,
} from '../application/use-cases/customer.use-cases.js';
import { CouchdbCustomerRepository } from '../infrastructure/repositories/couchdb-customer.repository.js';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface.js';

@Module({
  imports: [CouchdbModule],
  controllers: [CustomersController],
  providers: [
    RegisterCustomerUseCase,
    UpdateCustomerUseCase,
    BlockCustomerUseCase,
    UnblockCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: CouchdbCustomerRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
