import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { Public } from './decorators/public.decorator.js';
import { CurrentAdmin } from './decorators/current-admin.decorator.js';
import type { CurrentAdminPayload } from './decorators/current-admin.decorator.js';
import { LoginDto } from '../application/dto/login.dto.js';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import { ADMIN_REPOSITORY } from '../domain/repositories/admin.repository.interface.js';
import type { IAdminRepository } from '../domain/repositories/admin.repository.interface.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  async getMe(@CurrentAdmin() currentAdmin: CurrentAdminPayload) {
    const admin = await this.adminRepository.findById(currentAdmin.id);
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return admin.toJSON();
  }

  @Get('admins')
  async getAdmins() {
    const admins = await this.adminRepository.findAll();
    return admins.map((a) => a.toJSON());
  }
}
