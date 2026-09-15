import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface.js';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { Admin } from '../../domain/entities/admin.entity.js';

@Injectable()
export class SeedAdminUseCase {
  private readonly logger = new Logger(SeedAdminUseCase.name);

  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<void> {
    try {
      const count = await this.adminRepository.count();
      if (count > 0) {
        this.logger.log(`Admins ya inicializados (${count} administradores en la base de datos).`);
        return;
      }

      const username = this.configService.get<string>('ADMIN_SEED_USERNAME', 'admin');
      const rawPassword = this.configService.get<string>('ADMIN_SEED_PASSWORD', 'admin123');
      const fullName = this.configService.get<string>(
        'ADMIN_SEED_FULLNAME',
        'Administrador Principal',
      );
      const email = this.configService.get<string>(
        'ADMIN_SEED_EMAIL',
        'admin@videoclublapaz.bo',
      );

      const passwordHash = await bcrypt.hash(rawPassword, 10);
      const seedAdmin = Admin.create({
        username,
        passwordHash,
        fullName,
        email,
        role: 'superadmin',
      });

      await this.adminRepository.save(seedAdmin);
      this.logger.log(
        `🌱 Admin inicial creado exitosamente: usuario="${username}", pass="${rawPassword}" (ID: ${seedAdmin.id.value})`,
      );
    } catch (err: any) {
      this.logger.error(`Error al sembrar admin inicial: ${err?.message}`, err?.stack);
    }
  }
}
