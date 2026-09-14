import { Module } from '@nestjs/common';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { MoviesController } from './controllers/movies.controller.js';
import { CreateMovieUseCase } from '../application/use-cases/create-movie/create-movie.use-case.js';
import { SearchMoviesUseCase } from '../application/use-cases/search-movies/search-movies.use-case.js';
import { CouchdbMovieRepository } from '../infrastructure/repositories/couchdb-movie.repository.js';
import { MOVIE_REPOSITORY } from '../domain/repositories/movie.repository.interface.js';
import { CouchdbCopyRepository } from '../../copies/infrastructure/repositories/couchdb-copy.repository.js';
import { COPY_REPOSITORY } from '../../copies/domain/repositories/copy.repository.interface.js';

@Module({
  imports: [CouchdbModule],
  controllers: [MoviesController],
  providers: [
    CreateMovieUseCase,
    SearchMoviesUseCase,
    { provide: MOVIE_REPOSITORY, useClass: CouchdbMovieRepository },
    { provide: COPY_REPOSITORY, useClass: CouchdbCopyRepository },
  ],
  exports: [MOVIE_REPOSITORY],
})
export class MoviesModule {}
