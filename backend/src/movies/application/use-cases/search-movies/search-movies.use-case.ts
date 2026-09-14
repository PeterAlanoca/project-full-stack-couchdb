import { Inject, Injectable } from '@nestjs/common';
import type { IMovieRepository } from '../../../domain/repositories/movie.repository.interface.js';
import { MOVIE_REPOSITORY, MovieSearchCriteria } from '../../../domain/repositories/movie.repository.interface.js';
import { Movie } from '../../../domain/entities/movie.entity.js';

export class SearchMoviesQuery {
  title?: string;
  genre?: string;
  actor?: string;
  oscarCategory?: string;
}

@Injectable()
export class SearchMoviesUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(query: SearchMoviesQuery): Promise<Movie[]> {
    const hasAnyFilter = query.title || query.genre || query.actor || query.oscarCategory;
    if (!hasAnyFilter) return this.movieRepository.findAll();

    const criteria: MovieSearchCriteria = {
      title: query.title,
      genre: query.genre,
      actor: query.actor,
      oscarCategory: query.oscarCategory,
    };
    return this.movieRepository.search(criteria);
  }
}
