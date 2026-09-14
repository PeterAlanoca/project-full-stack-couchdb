import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface KpiCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface QuickAction {
  title: string;
  desc: string;
  icon: string;
  route: string;
  btnText: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpiCards = signal<KpiCard[]>([
    { label: 'Películas en Catálogo', value: '0', icon: '🎬', color: '#818cf8' },
    { label: 'Copias Totales', value: '0', icon: '📀', color: '#34d399' },
    { label: 'Clientes Registrados', value: '0', icon: '👥', color: '#60a5fa' },
    { label: 'Préstamos Activos', value: '0', icon: '🎟️', color: '#fbbf24' },
  ]);

  readonly quickActions: QuickAction[] = [
    {
      title: 'Nuevo Alquiler (POS)',
      desc: 'Emita un nuevo préstamo de DVDs seleccionando cliente y copias disponibles.',
      icon: '💳',
      route: '/rentals',
      btnText: 'Ir a POS',
    },
    {
      title: 'Catálogo de Películas',
      desc: 'Registre nuevas películas, añada copias o registre bajas con motivo y fecha.',
      icon: '🎬',
      route: '/movies',
      btnText: 'Ver Películas',
    },
    {
      title: 'Gestión de Clientes',
      desc: 'Administre el registro de nuevos clientes, teléfonos, emails y bloqueos.',
      icon: '👥',
      route: '/customers',
      btnText: 'Ver Clientes',
    },
    {
      title: 'Historial y Devoluciones',
      desc: 'Consulte préstamos activos, fechas límites y procese devoluciones de DVDs.',
      icon: '📜',
      route: '/rentals/history',
      btnText: 'Ver Historial',
    },
  ];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      movies: this.api.get<any[]>('movies').pipe(catchError(() => of([]))),
      customers: this.api.get<any[]>('customers').pipe(catchError(() => of([]))),
      rentals: this.api.get<any[]>('rentals').pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ movies, customers, rentals }) => {
        const activeRentals = rentals.filter((r: any) => r.status === 'active').length;
        this.kpiCards.set([
          { label: 'Películas en Catálogo', value: movies.length, icon: '🎬', color: '#818cf8' },
          { label: 'Copias Totales', value: movies.reduce((acc, m) => acc + (m.initialCopies || m.copiesCount || 1), 0), icon: '📀', color: '#34d399' },
          { label: 'Clientes Registrados', value: customers.length, icon: '👥', color: '#60a5fa' },
          { label: 'Préstamos Activos', value: activeRentals, icon: '🎟️', color: '#fbbf24' },
        ]);
      },
    });
  }
}
