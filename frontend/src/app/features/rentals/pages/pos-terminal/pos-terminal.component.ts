import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface Customer {
  _id: string;
  dni?: string;
  fullName: string;
  phone: string;
  email: string;
  status: 'active' | 'blocked' | 'inactive';
  blockReason?: string;
}

export interface Movie {
  _id: string;
  title: string;
  genres: string[];
  unitCost: number;
  availableCopiesCount?: number;
  copies?: Array<{
    _id: string;
    copyNumber: number;
    status: 'available' | 'rented' | 'decommissioned';
  }>;
}

export interface CartItem {
  movieId: string;
  copyId: string;
  movieTitle: string;
  copyNumber: number;
  rentalDays: number;
  dailyRate: number;
}

export interface PricePreviewResponse {
  subtotal: number;
  discount: number;
  total: number;
  items: Array<{
    copyId: string;
    movieTitle: string;
    dailyRate: number;
    rentalDays: number;
    subtotal: number;
  }>;
}

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pos-terminal.component.html',
  styleUrl: './pos-terminal.component.scss'
})
export class PosTerminalComponent implements OnInit {
  customers = signal<Customer[]>([]);
  movies = signal<Movie[]>([]);

  customerQuery = signal<string>('');
  selectedCustomer = signal<Customer | null>(null);

  movieSearchQuery = signal<string>('');
  cart = signal<CartItem[]>([]);

  isProcessing = signal<boolean>(false);

  filteredCustomersList = computed(() => {
    const q = this.customerQuery().toLowerCase().trim();
    if (!q) return [];
    return this.customers().filter(
      (c) =>
        (c.dni && c.dni.toLowerCase().includes(q)) ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  });

  filteredMovies = computed(() => {
    const q = this.movieSearchQuery().toLowerCase().trim();
    if (!q) return this.movies();
    return this.movies().filter((m) => m.title.toLowerCase().includes(q));
  });

  estimatedPrice = computed(() => {
    const items = this.cart();
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.dailyRate || 2.5) * (item.rentalDays || 1);
    }
    // Simple mock / preview logic: 10% discount for >= 3 movies
    const discount = items.length >= 3 ? subtotal * 0.1 : 0;
    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
    };
  });

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.api.get<Customer[]>('customers').subscribe({
      next: (data) => this.customers.set(data),
      error: () => this.toast.error('Error al cargar clientes.'),
    });

    this.api.get<Movie[]>('movies').subscribe({
      next: (data) => this.movies.set(data),
      error: () => this.toast.error('Error al cargar catálogo de películas.'),
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const p = name.trim().split(' ');
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
  }

  selectCustomer(cust: Customer): void {
    if (cust.status === 'blocked') {
      this.toast.error(`El cliente ${cust.fullName} se encuentra bloqueado.`);
    }
    this.selectedCustomer.set(cust);
    this.customerQuery.set('');
  }

  addMovieToCart(movie: Movie): void {
    // Check if already in cart
    const exists = this.cart().find((i) => i.movieId === movie._id);
    if (exists) {
      this.toast.warning('Esta película ya está añadida al carrito.');
      return;
    }

    const newItem: CartItem = {
      movieId: movie._id,
      copyId: `${movie._id}_copy_${Date.now()}`,
      movieTitle: movie.title,
      copyNumber: (this.cart().length + 1),
      rentalDays: 3,
      dailyRate: 2.5,
    };

    this.cart.update((c) => [...c, newItem]);
    this.toast.success(`"${movie.title}" añadida al préstamo.`);
  }

  updateItemDays(index: number, days: number): void {
    const num = Math.max(1, Number(days) || 1);
    this.cart.update((c) => {
      const updated = [...c];
      updated[index] = { ...updated[index], rentalDays: num };
      return updated;
    });
  }

  removeItemFromCart(index: number): void {
    this.cart.update((c) => c.filter((_, i) => i !== index));
  }

  canCheckout(): boolean {
    const cust = this.selectedCustomer();
    return !!(cust && cust.status === 'active' && this.cart().length > 0);
  }

  processCheckout(): void {
    const cust = this.selectedCustomer();
    if (!cust || cust.status !== 'active') {
      this.toast.error('Debe seleccionar un cliente activo.');
      return;
    }
    if (this.cart().length === 0) {
      this.toast.error('El carrito de préstamo está vacío.');
      return;
    }

    this.isProcessing.set(true);

    const rentalPayload = {
      customerId: cust._id,
      items: this.cart().map((item) => ({
        movieId: item.movieId,
        days: Number(item.rentalDays) || 1,
      })),
    };

    this.api.post('rentals', rentalPayload).subscribe({
      next: () => {
        this.toast.success('¡Préstamo registrado exitosamente!');
        this.isProcessing.set(false);
        this.cart.set([]);
        this.selectedCustomer.set(null);
      },
      error: () => {
        this.isProcessing.set(false);
        this.toast.error('Error al registrar el préstamo en el servidor.');
      },
    });
  }
}
