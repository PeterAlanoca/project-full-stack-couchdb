import { Inject, Injectable } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { EntityNotFoundException } from '../../../shared/application/exceptions/domain.exception.js';
import { RegisterCustomerDto, UpdateCustomerDto, BlockCustomerDto } from './customer.dto.js';

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(dto: RegisterCustomerDto, adminId?: string): Promise<Customer> {
    const street = dto.address?.street || 'Sin especificar';
    const city = dto.address?.city || 'Sin especificar';
    const lng = Number(dto.address?.coordinates?.longitude) || 0;
    const lat = Number(dto.address?.coordinates?.latitude) || 0;

    const customer = Customer.create({
      dni: dto.dni || '',
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      birthDate: new Date(dto.birthDate),
      address: {
        street,
        city,
        coordinates: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
      createdBy: adminId || null,
    });
    return this.customerRepository.save(customer);
  }
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(customerId: string, dto: UpdateCustomerDto, adminId?: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new EntityNotFoundException('Customer', customerId);
    const updated = customer.update({
      ...(dto.dni !== undefined && { dni: dto.dni }),
      ...(dto.fullName && { fullName: dto.fullName }),
      ...(dto.phone && { phone: dto.phone }),
      ...(dto.email && { email: dto.email }),
      ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
      ...(dto.address && {
        address: {
          street: dto.address.street || 'Sin especificar',
          city: dto.address.city || 'Sin especificar',
          coordinates: {
            type: 'Point' as const,
            coordinates: [
              Number(dto.address.coordinates?.longitude) || 0,
              Number(dto.address.coordinates?.latitude) || 0,
            ] as [number, number],
          },
        },
      }),
      updatedBy: adminId || null,
    });
    return this.customerRepository.update(updated);
  }
}

@Injectable()
export class BlockCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(customerId: string, dto: BlockCustomerDto, adminId?: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new EntityNotFoundException('Customer', customerId);
    const blocked = customer.blockCustomer(dto.reason, adminId);
    return this.customerRepository.update(blocked);
  }
}

@Injectable()
export class UnblockCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(customerId: string, adminId?: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new EntityNotFoundException('Customer', customerId);
    const unblocked = customer.unblock(adminId);
    return this.customerRepository.update(unblocked);
  }
}
