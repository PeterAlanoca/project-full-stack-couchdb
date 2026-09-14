import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface RentalItem {
  copyId: string;
  movieId: string;
  movieTitle: string;
  days: number;
  pricePerRental?: number;
}

export interface RentalRecord {
  _id: string;
  id?: string;
  customerId: string;
  customerSnapshot?: {
    fullName: string;
    email: string;
    dni?: string;
  };
  items: RentalItem[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  total: number;
  status: 'active' | 'returned' | 'overdue';
  rentedAt: string;
  dueDate: string;
  returnedAt?: string | null;
}

@Component({
  selector: 'app-rentals-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rentals-history.component.html',
  styleUrl: './rentals-history.component.scss'
})
export class RentalsHistoryComponent implements OnInit {
  rentals = signal<RentalRecord[]>([]);
  customerMap = signal<Record<string, any>>({});
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  searchQuery = signal<string>('');
  selectedStatus = signal<string>('ALL');

  filteredRentals = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const custMap = this.customerMap();

    return this.rentals().filter((r) => {
      const dni = (r.customerSnapshot?.dni || custMap[r.customerId]?.dni || '').toLowerCase();
      const name = (r.customerSnapshot?.fullName || custMap[r.customerId]?.fullName || '').toLowerCase();
      const email = (r.customerSnapshot?.email || custMap[r.customerId]?.email || '').toLowerCase();

      const matchQuery =
        !q ||
        r._id.toLowerCase().includes(q) ||
        dni.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        (r.items || []).some((i) => i.movieTitle?.toLowerCase().includes(q));

      const matchStatus = status === 'ALL' || r.status === status;
      return matchQuery && matchStatus;
    });
  });

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.isLoading.set(true);

    // Cargar clientes para mapeo de respaldo de DNI
    this.api.get<any[]>('customers').subscribe({
      next: (custs) => {
        const map: Record<string, any> = {};
        for (const c of custs) {
          map[c._id] = c;
          if (c.id) map[c.id] = c;
        }
        this.customerMap.set(map);
      },
      error: () => {},
    });

    this.api.get<RentalRecord[]>('rentals').subscribe({
      next: (data) => {
        this.rentals.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar historial de préstamos.');
      },
    });
  }

  getCustomerDni(rental: RentalRecord): string {
    const dni = rental.customerSnapshot?.dni || this.customerMap()[rental.customerId]?.dni;
    return dni ? dni : 'No reg.';
  }

  getCustomerName(rental: RentalRecord): string {
    return rental.customerSnapshot?.fullName || this.customerMap()[rental.customerId]?.fullName || 'Cliente ' + rental.customerId.slice(-6);
  }

  getCustomerEmail(rental: RentalRecord): string {
    return rental.customerSnapshot?.email || this.customerMap()[rental.customerId]?.email || 'Sin correo';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const p = name.trim().split(' ');
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
  }

  processReturn(rental: RentalRecord): void {
    const custName = this.getCustomerName(rental);
    if (!confirm(`¿Confirma la devolución de las copias prestadas a ${custName}?`)) {
      return;
    }

    this.isSubmitting.set(true);
    this.api.patch<RentalRecord>(`rentals/${rental._id}/return`, {}).subscribe({
      next: () => {
        this.toast.success(`¡Devolución de préstamo procesada exitosamente!`);
        this.isSubmitting.set(false);
        this.loadRentals();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Error al registrar la devolución en el servidor.');
      },
    });
  }
}
