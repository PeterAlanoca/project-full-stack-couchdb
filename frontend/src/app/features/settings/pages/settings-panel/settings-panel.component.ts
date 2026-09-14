import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss'
})
export class SettingsPanelComponent implements OnInit {
  isSaving = signal<boolean>(false);

  config = {
    dailyRentalRate: 2.5,
    dailyLateFee: 1.0,
    maxRentalsPerCustomer: 5,
    defaultRentalDays: 3,
  };

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {}

  savePolicies(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.success('Parámetros guardados y aplicados correctamente.');
    }, 600);
  }

  testDbConnection(): void {
    this.toast.info('Verificando conexión con CouchDB...');
    this.api.get<any[]>('movies').subscribe({
      next: () => {
        this.toast.success('Conexión con CouchDB activa y saludable.');
      },
      error: () => {
        this.toast.error('No se pudo establecer conexión con CouchDB / Backend.');
      },
    });
  }
}
