import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { LoginDto } from '../dto/login.dto.js';

export interface LoginResult {
  access_token: string;
  admin: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const admin = await this.adminRepository.findByUsername(dto.username);
    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('El usuario administrador se encuentra inactivo');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const updatedAdmin = admin.recordLogin();
    await this.adminRepository.update(updatedAdmin);

    const payload = {
      sub: admin.id.value,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      admin: {
        id: admin.id.value,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
