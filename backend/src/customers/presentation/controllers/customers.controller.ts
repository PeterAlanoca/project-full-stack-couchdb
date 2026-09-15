import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import {
  RegisterCustomerUseCase,
  UpdateCustomerUseCase,
  BlockCustomerUseCase,
  UnblockCustomerUseCase,
} from '../../application/use-cases/customer.use-cases.js';
import { RegisterCustomerDto, UpdateCustomerDto, BlockCustomerDto } from '../../application/use-cases/customer.dto.js';
import { Inject } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import { CurrentAdmin } from '../../../auth/presentation/decorators/current-admin.decorator.js';
import type { CurrentAdminPayload } from '../../../auth/presentation/decorators/current-admin.decorator.js';

@Controller('customers')
export class CustomersController {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly registerUseCase: RegisterCustomerUseCase,
    private readonly updateUseCase: UpdateCustomerUseCase,
    private readonly blockUseCase: BlockCustomerUseCase,
    private readonly unblockUseCase: UnblockCustomerUseCase,
  ) {}

  @Get()
  findAll() {
    return this.customerRepository.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.customerRepository.findById(id);
  }

  @Post()
  register(
    @Body() dto: RegisterCustomerDto,
    @CurrentAdmin() admin?: CurrentAdminPayload,
  ) {
    const adminIdentifier = admin ? `${admin.fullName} (${admin.username})` : 'admin';
    return this.registerUseCase.execute(dto, adminIdentifier);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentAdmin() admin?: CurrentAdminPayload,
  ) {
    const adminIdentifier = admin ? `${admin.fullName} (${admin.username})` : 'admin';
    return this.updateUseCase.execute(id, dto, adminIdentifier);
  }

  @Patch(':id/block')
  block(
    @Param('id') id: string,
    @Body() dto: BlockCustomerDto,
    @CurrentAdmin() admin?: CurrentAdminPayload,
  ) {
    const adminIdentifier = admin ? `${admin.fullName} (${admin.username})` : 'admin';
    return this.blockUseCase.execute(id, dto, adminIdentifier);
  }

  @Patch(':id/unblock')
  unblock(
    @Param('id') id: string,
    @CurrentAdmin() admin?: CurrentAdminPayload,
  ) {
    const adminIdentifier = admin ? `${admin.fullName} (${admin.username})` : 'admin';
    return this.unblockUseCase.execute(id, adminIdentifier);
  }
}
