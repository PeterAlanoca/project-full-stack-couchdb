import { Inject, Injectable } from '@nestjs/common';
import type { ICopyRepository } from '../../domain/repositories/copy.repository.interface.js';
import { COPY_REPOSITORY } from '../../domain/repositories/copy.repository.interface.js';
import type { IMovieRepository } from '../../../movies/domain/repositories/movie.repository.interface.js';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories/movie.repository.interface.js';
import { Copy, DeactivationReason } from '../../domain/entities/copy.entity.js';
import { EntityNotFoundException } from '../../../shared/application/exceptions/domain.exception.js';
import { AddCopiesDto, DeactivateCopyDto } from './copies.dto.js';

@Injectable()
export class AddCopiesUseCase {
  constructor(
    @Inject(COPY_REPOSITORY) private readonly copyRepository: ICopyRepository,
    @Inject(MOVIE_REPOSITORY) private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(movieId: string, dto: AddCopiesDto): Promise<Copy[]> {
    const movie = await this.movieRepository.findById(movieId);
    if (!movie) throw new EntityNotFoundException('Movie', movieId);

    const existingCopies = await this.copyRepository.findByMovieId(movieId);
    const startIndex = existingCopies.length + 1;

    const newCopies: Copy[] = [];
    for (let i = 0; i < dto.quantity; i++) {
      const copyCode = `${movieId.slice(-6).toUpperCase()}-${String(startIndex + i).padStart(3, '0')}`;
      const copy = Copy.create({ movieId, copyCode });
      const saved = await this.copyRepository.save(copy);
      newCopies.push(saved);
    }
    return newCopies;
  }
}

@Injectable()
export class DeactivateCopyUseCase {
  constructor(
    @Inject(COPY_REPOSITORY) private readonly copyRepository: ICopyRepository,
  ) {}

  async execute(copyId: string, dto: DeactivateCopyDto): Promise<Copy> {
    const copy = await this.copyRepository.findById(copyId);
    if (!copy) throw new EntityNotFoundException('Copy', copyId);
    const deactivated = copy.deactivate(dto.reason as DeactivationReason, dto.notes);
    return this.copyRepository.update(deactivated);
  }
}
