import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches CouchDB HTTP 409 Conflict errors (MVCC revision mismatch)
 * and properly passes through standard NestJS HttpExceptions (401, 404, 400, etc.).
 */
@Catch()
export class CouchdbConflictFilter implements ExceptionFilter {
  private readonly logger = new Logger(CouchdbConflictFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // CouchDB returns statusCode 409 or error 'conflict' on revision mismatch
    const isCouchConflict =
      exception?.statusCode === 409 ||
      exception?.error === 'conflict' ||
      exception?.message?.includes('Document update conflict');

    if (isCouchConflict) {
      this.logger.warn(
        `CouchDB MVCC Conflict on ${request.method} ${request.url}`,
      );
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'COUCHDB_CONFLICT',
        message:
          'The document was modified by another operation. Please retry.',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Pass through standard NestJS HttpExceptions (e.g. 401 Unauthorized, 404, 400)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(res as object),
        });
      } else {
        response.status(status).json({
          statusCode: status,
          message: res,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
      return;
    }

    // Default 500 error
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_ERROR',
      message: exception?.message ?? 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
