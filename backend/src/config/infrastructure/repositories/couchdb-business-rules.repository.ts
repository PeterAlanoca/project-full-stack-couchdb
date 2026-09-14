import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import { IBusinessRulesRepository } from '../../domain/repositories/business-rules.repository.interface.js';
import { BusinessRules, BusinessRulesProps } from '../../domain/entities/business-rules.entity.js';

@Injectable()
export class CouchdbBusinessRulesRepository implements IBusinessRulesRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<any>,
  ) {}

  async get(): Promise<BusinessRules> {
    try {
      const doc = await this.db.get(BusinessRules.DOCUMENT_ID);
      return BusinessRules.reconstitute(
        {
          rentalPricing: doc.rentalPricing,
          volumeDiscounts: doc.volumeDiscounts,
          maxRentalDays: doc.maxRentalDays,
          updatedAt: new Date(doc.updatedAt),
        },
        doc._rev,
      );
    } catch {
      // Seed default rules on first access
      const defaults = BusinessRules.default();
      return this.save(defaults);
    }
  }

  async save(rules: BusinessRules): Promise<BusinessRules> {
    const doc: any = {
      _id: BusinessRules.DOCUMENT_ID,
      type: 'business_rules',
      rentalPricing: rules.rentalPricing,
      volumeDiscounts: rules.volumeDiscounts,
      maxRentalDays: rules.maxRentalDays,
      updatedAt: rules.updatedAt.toISOString(),
    };
    if (rules._rev) doc._rev = rules._rev;
    await this.db.insert(doc);
    return rules;
  }
}
