import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { AddCopiesUseCase, DeactivateCopyUseCase } from '../../application/use-cases/copies.use-cases.js';
import { AddCopiesDto, DeactivateCopyDto } from '../../application/use-cases/copies.dto.js';

@Controller()
export class CopiesController {
  constructor(
    private readonly addCopiesUseCase: AddCopiesUseCase,
    private readonly deactivateCopyUseCase: DeactivateCopyUseCase,
  ) {}

  /** POST /api/movies/:movieId/copies — Add new copies to a movie */
  @Post('movies/:movieId/copies')
  async addCopies(@Param('movieId') movieId: string, @Body() dto: AddCopiesDto) {
    return this.addCopiesUseCase.execute(movieId, dto);
  }

  /** PATCH /api/copies/:copyId/deactivate — Deactivate copy with reason and date */
  @Patch('copies/:copyId/deactivate')
  async deactivate(@Param('copyId') copyId: string, @Body() dto: DeactivateCopyDto) {
    return this.deactivateCopyUseCase.execute(copyId, dto);
  }
}
