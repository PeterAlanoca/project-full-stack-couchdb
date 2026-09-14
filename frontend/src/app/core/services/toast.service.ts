import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private _nextId = 0;

  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  show(message: string, type: ToastType = 'info', durationMs = 4000): void {
    const id = ++this._nextId;
    this._toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  remove(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
