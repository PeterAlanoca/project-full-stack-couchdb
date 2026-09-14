import { Module } from '@nestjs/common';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { ConfigController } from './controllers/config.controller.js';
import { CouchdbBusinessRulesRepository } from '../infrastructure/repositories/couchdb-business-rules.repository.js';
import { BUSINESS_RULES_REPOSITORY } from '../domain/repositories/business-rules.repository.interface.js';

@Module({
  imports: [CouchdbModule],
  controllers: [ConfigController],
  providers: [
    { provide: BUSINESS_RULES_REPOSITORY, useClass: CouchdbBusinessRulesRepository },
  ],
  exports: [BUSINESS_RULES_REPOSITORY],
})
export class ConfigBoundedModule {}
