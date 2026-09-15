import { Admin } from '../entities/admin.entity.js';

export const ADMIN_REPOSITORY = 'ADMIN_REPOSITORY';

export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByUsername(username: string): Promise<Admin | null>;
  findAll(): Promise<Admin[]>;
  save(admin: Admin): Promise<Admin>;
  update(admin: Admin): Promise<Admin>;
  count(): Promise<number>;
}
