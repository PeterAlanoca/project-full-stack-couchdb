import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MapPickerComponent, LatLng } from '../../../../shared/components/map-picker/map-picker.component';

export interface Customer {
  _id: string;
  _rev?: string;
  dni?: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  address?: {
    street: string;
    city: string;
    coordinates?: {
      type?: string;
      coordinates?: [number, number];
      longitude?: number;
      latitude?: number;
    };
  };
  status: 'active' | 'blocked';
  block?: { reason: string; blockedAt: string } | null;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MapPickerComponent],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  searchQuery = signal<string>('');
  selectedStatus = signal<string>('ALL');

  showFormModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  showBlockModal = signal<boolean>(false);
  showMap = signal<boolean>(false);
  selectedCustomer = signal<Customer | null>(null);
  blockReasonInput = '';

  formData = {
    dni: '',
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    street: '',
    city: '',
    latitude: 10.4806,
    longitude: -66.9036,
  };

  filteredCustomers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.customers().filter((c) => {
      const matchQuery =
        !q ||
        (c.dni && c.dni.toLowerCase().includes(q)) ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address?.city && c.address.city.toLowerCase().includes(q)) ||
        (c.address?.street && c.address.street.toLowerCase().includes(q));

      const matchStatus = status === 'ALL' || c.status === status;
      return matchQuery && matchStatus;
    });
  });

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.api.get<Customer[]>('customers').subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar la lista de clientes.');
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formData = {
      dni: '',
      fullName: '',
      phone: '',
      email: '',
      birthDate: '',
      street: '',
      city: '',
      latitude: 10.4806,
      longitude: -66.9036,
    };
    this.showFormModal.set(true);
  }

  openEditModal(customer: Customer): void {
    this.isEditing.set(true);
    this.selectedCustomer.set(customer);
    const coords = customer.address?.coordinates?.coordinates || [-66.9036, 10.4806];
    this.formData = {
      dni: customer.dni || '',
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      birthDate: customer.birthDate ? customer.birthDate.slice(0, 10) : '',
      street: customer.address?.street || '',
      city: customer.address?.city || '',
      longitude: coords[0] ?? -66.9036,
      latitude: coords[1] ?? 10.4806,
    };
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.showMap.set(false);
  }

  toggleMap(): void {
    this.showMap.update((v) => !v);
  }

  onLocationSelected(coords: LatLng): void {
    this.formData.latitude = parseFloat(coords.lat.toFixed(6));
    this.formData.longitude = parseFloat(coords.lng.toFixed(6));
  }

  isFormValid(): boolean {
    return !!(
      this.formData.fullName.trim() &&
      this.formData.phone.trim() &&
      this.formData.email.trim() &&
      this.formData.birthDate
    );
  }

  saveCustomer(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const payload = {
      dni: (this.formData.dni || '').trim(),
      fullName: this.formData.fullName.trim(),
      phone: this.formData.phone.trim(),
      email: this.formData.email.trim().toLowerCase(),
      birthDate: this.formData.birthDate,
      address: {
        street: this.formData.street.trim() || 'Sin especificar',
        city: this.formData.city.trim() || 'Sin especificar',
        coordinates: {
          longitude: Number(this.formData.longitude) || 0,
          latitude: Number(this.formData.latitude) || 0,
        },
      },
    };

    if (this.isEditing()) {
      const customerId = this.selectedCustomer()?._id;
      if (!customerId) return;

      this.api.patch<Customer>(`customers/${customerId}`, payload).subscribe({
        next: () => {
          this.toast.success('Cliente actualizado correctamente.');
          this.isSubmitting.set(false);
          this.showFormModal.set(false);
          this.loadCustomers();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Error al actualizar el cliente.');
        },
      });
    } else {
      this.api.post<Customer>('customers', payload).subscribe({
        next: () => {
          this.toast.success('¡Cliente registrado exitosamente!');
          this.isSubmitting.set(false);
          this.showFormModal.set(false);
          this.loadCustomers();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Error al registrar el cliente.');
        },
      });
    }
  }

  openBlockModal(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.blockReasonInput = '';
    this.showBlockModal.set(true);
  }

  confirmBlockCustomer(): void {
    const customer = this.selectedCustomer();
    if (!customer || !this.blockReasonInput.trim()) return;

    this.isSubmitting.set(true);
    this.api
      .patch<Customer>(`customers/${customer._id}/block`, {
        reason: this.blockReasonInput.trim(),
      })
      .subscribe({
        next: () => {
          this.toast.warning(`El cliente ${customer.fullName} ha sido bloqueado.`);
          this.isSubmitting.set(false);
          this.showBlockModal.set(false);
          this.loadCustomers();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('No se pudo bloquear al cliente.');
        },
      });
  }

  unblockCustomer(customer: Customer): void {
    this.api.patch<Customer>(`customers/${customer._id}/unblock`, {}).subscribe({
      next: () => {
        this.toast.success(`El cliente ${customer.fullName} ha sido desbloqueado.`);
        this.loadCustomers();
      },
      error: () => {
        this.toast.error('No se pudo desbloquear al cliente.');
      },
    });
  }
}
