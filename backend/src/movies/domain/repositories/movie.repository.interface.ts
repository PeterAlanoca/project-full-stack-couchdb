import { Movie } from '../entities/movie.entity.js';

export interface MovieSearchCriteria {
  title?: string;
  genre?: string;
  actor?: string;
  oscarCategory?: string;
}

export interface IMovieRepository {
  findById(id: string): Promise<Movie | null>;
  findAll(): Promise<Movie[]>;
  search(criteria: MovieSearchCriteria): Promise<Movie[]>;
  save(movie: Movie): Promise<Movie>;
  update(movie: Movie): Promise<Movie>;
}

export const MOVIE_REPOSITORY = Symbol('IMovieRepository');
