import { Module } from '@nestjs/common';
import { CouchdbModule } from '../../shared/infrastructure/couchdb/couchdb.module.js';
import { CopiesController } from './controllers/copies.controller.js';
import { AddCopiesUseCase, DeactivateCopyUseCase } from '../application/use-cases/copies.use-cases.js';
import { CouchdbCopyRepository } from '../infrastructure/repositories/couchdb-copy.repository.js';
import { COPY_REPOSITORY } from '../domain/repositories/copy.repository.interface.js';
import { CouchdbMovieRepository } from '../../movies/infrastructure/repositories/couchdb-movie.repository.js';
import { MOVIE_REPOSITORY } from '../../movies/domain/repositories/movie.repository.interface.js';

@Module({
  imports: [CouchdbModule],
  controllers: [CopiesController],
  providers: [
    AddCopiesUseCase,
    DeactivateCopyUseCase,
    { provide: COPY_REPOSITORY, useClass: CouchdbCopyRepository },
    { provide: MOVIE_REPOSITORY, useClass: CouchdbMovieRepository },
  ],
  exports: [COPY_REPOSITORY],
})
export class CopiesModule {}
