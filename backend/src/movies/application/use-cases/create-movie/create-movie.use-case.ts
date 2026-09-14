import { Inject, Injectable } from '@nestjs/common';
import type { IMovieRepository } from '../../../domain/repositories/movie.repository.interface.js';
import { MOVIE_REPOSITORY } from '../../../domain/repositories/movie.repository.interface.js';
import type { ICopyRepository } from '../../../../copies/domain/repositories/copy.repository.interface.js';
import { COPY_REPOSITORY } from '../../../../copies/domain/repositories/copy.repository.interface.js';
import { Movie } from '../../../domain/entities/movie.entity.js';
import { Copy } from '../../../../copies/domain/entities/copy.entity.js';
import { Oscar } from '../../../domain/value-objects/oscar.value-object.js';
import { CreateMovieDto } from './create-movie.dto.js';

@Injectable()
export class CreateMovieUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepository: IMovieRepository,
    @Inject(COPY_REPOSITORY) private readonly copyRepository: ICopyRepository,
  ) {}

  async execute(dto: CreateMovieDto): Promise<{ movie: Movie; copies: Copy[] }> {
    const movie = Movie.create({
      title: dto.title,
      alternativeTitles: dto.alternativeTitles ?? [],
      durationMinutes: dto.durationMinutes,
      genres: dto.genres,
      year: dto.year,
      actors: dto.actors,
      oscars: (dto.oscars ?? []).map((o) => Oscar.create(o.category, o.year, o.won)),
      unitCostBs: dto.unitCostBs,
    });

    const savedMovie = await this.movieRepository.save(movie);

    const copies: Copy[] = [];
    for (let i = 1; i <= dto.initialCopies; i++) {
      const copyCode = `${savedMovie.id.value.slice(-6).toUpperCase()}-${String(i).padStart(3, '0')}`;
      const copy = Copy.create({ movieId: savedMovie.id.value, copyCode });
      const savedCopy = await this.copyRepository.save(copy);
      copies.push(savedCopy);
    }

    return { movie: savedMovie, copies };
  }
}
