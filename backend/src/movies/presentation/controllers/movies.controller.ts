import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CreateMovieUseCase } from '../../application/use-cases/create-movie/create-movie.use-case.js';
import { SearchMoviesUseCase } from '../../application/use-cases/search-movies/search-movies.use-case.js';
import { CreateMovieDto } from '../../application/use-cases/create-movie/create-movie.dto.js';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly createMovieUseCase: CreateMovieUseCase,
    private readonly searchMoviesUseCase: SearchMoviesUseCase,
  ) {}

  /**
   * GET /api/movies
   * Query params: ?title=&genre=&actor=&oscarCategory=
   */
  @Get()
  async findAll(
    @Query('title') title?: string,
    @Query('genre') genre?: string,
    @Query('actor') actor?: string,
    @Query('oscarCategory') oscarCategory?: string,
  ) {
    return this.searchMoviesUseCase.execute({ title, genre, actor, oscarCategory });
  }

  /**
   * POST /api/movies
   * Registers a new movie with initial copies
   */
  @Post()
  async create(@Body() dto: CreateMovieDto) {
    return this.createMovieUseCase.execute(dto);
  }
}
