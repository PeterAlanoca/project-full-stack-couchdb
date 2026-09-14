import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches CouchDB HTTP 409 Conflict errors (MVCC revision mismatch).
 * These occur when two concurrent writes target the same document with the same _rev.
 * This is the core of CouchDB's optimistic concurrency control demonstration.
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

    // Re-throw for other exception filters to handle
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_ERROR',
      message: exception?.message ?? 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
