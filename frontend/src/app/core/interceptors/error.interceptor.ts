import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Ha ocurrido un error inesperado.';

      if (error.status === 409) {
        message = 'Conflicto de concurrencia. Por favor, inténtelo de nuevo.';
      } else if (error.status === 404) {
        message = 'El recurso solicitado no fue encontrado.';
      } else if (error.status === 400) {
        message = error.error?.message ?? 'Datos inválidos en la solicitud.';
      } else if (error.status === 0) {
        message = 'No se pudo conectar con el servidor. Verifique su conexión.';
      } else if (error.error?.message) {
        message = error.error.message;
      }

      toast.error(message);
      return throwError(() => error);
    }),
  );
};
