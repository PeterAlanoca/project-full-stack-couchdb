import { Copy, DeactivationReason } from '../entities/copy.entity.js';

export interface ICopyRepository {
  findById(id: string): Promise<Copy | null>;
  findByMovieId(movieId: string): Promise<Copy[]>;
  findAvailableByMovieId(movieId: string): Promise<Copy[]>;
  save(copy: Copy): Promise<Copy>;
  update(copy: Copy): Promise<Copy>;
  bulkUpdate(copies: Copy[]): Promise<Copy[]>;
}

export const COPY_REPOSITORY = Symbol('ICopyRepository');
