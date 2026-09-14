import { BusinessRules } from '../entities/business-rules.entity.js';

export interface IBusinessRulesRepository {
  get(): Promise<BusinessRules>;
  save(rules: BusinessRules): Promise<BusinessRules>;
}

export const BUSINESS_RULES_REPOSITORY = Symbol('IBusinessRulesRepository');
