import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  iconFor(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || 'ℹ️';
  }
}
