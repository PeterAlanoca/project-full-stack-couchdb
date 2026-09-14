import { Customer } from '../entities/customer.entity.js';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
