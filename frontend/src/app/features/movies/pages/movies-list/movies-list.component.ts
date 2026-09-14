import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface Oscar {
  category: string;
  year: number;
  won: boolean;
}

export interface CopyItem {
  _id: string;
  movieId: string;
  copyNumber: number;
  status: 'available' | 'rented' | 'decommissioned';
  decommissionReason?: string;
  decommissionDate?: string;
}

export interface Movie {
  _id: string;
  title: string;
  alternativeTitles: string[];
  durationMinutes: number;
  genres: string[];
  year: number;
  actors: string[];
  oscars: Oscar[];
  unitCostBs: number;
  copiesCount?: number;
  availableCopiesCount?: number;
}

@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movies-list.component.html',
  styleUrl: './movies-list.component.scss'
})
export class MoviesListComponent implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  showForm = signal<boolean>(false);
  showCopiesModal = signal<boolean>(false);
  selectedMovie = signal<Movie | null>(null);

  searchQuery = signal<string>('');

  newCopiesCount = 1;
  newCopiesCost = 15.0;

  decommissionData = {
    copyId: '',
    date: new Date().toISOString().slice(0, 10),
    reason: 'not_returned',
    notes: '',
  };

  form = {
    title: '',
    year: new Date().getFullYear(),
    durationMinutes: 120,
    unitCostBs: 15.0,
    initialCopies: 3,
    genresRaw: '',
    alternativeTitlesRaw: '',
    actorsRaw: '',
    oscars: [] as Oscar[],
  };

  filteredMovies = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.movies();

    return this.movies().filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.actors.some((a) => a.toLowerCase().includes(q)) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.alternativeTitles.some((t) => t.toLowerCase().includes(q)) ||
        m.oscars.some((o) => o.category.toLowerCase().includes(q))
    );
  });

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading.set(true);
    this.api.get<Movie[]>('movies').subscribe({
      next: (data) => {
        this.movies.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar catálogo de películas.');
      },
    });
  }

  getOscarsSummary(oscars: Oscar[]): string {
    const wonCount = oscars.filter((o) => o.won).length;
    const nomCount = oscars.length;
    if (wonCount > 0) {
      return `${wonCount} Ganado(s) de ${nomCount} nominación(es)`;
    }
    return `${nomCount} Nominación(es)`;
  }

  openCreateModal(): void {
    this.form = {
      title: '',
      year: new Date().getFullYear(),
      durationMinutes: 120,
      unitCostBs: 15.0,
      initialCopies: 3,
      genresRaw: '',
      alternativeTitlesRaw: '',
      actorsRaw: '',
      oscars: [],
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  addOscarField(): void {
    this.form.oscars.push({
      category: '',
      year: this.form.year || new Date().getFullYear(),
      won: true,
    });
  }

  removeOscarField(index: number): void {
    this.form.oscars.splice(index, 1);
  }

  isMovieFormValid(): boolean {
    return !!(this.form.title.trim() && this.form.genresRaw.trim() && this.form.durationMinutes > 0);
  }

  saveMovie(): void {
    if (!this.isMovieFormValid() || this.saving()) return;
    this.saving.set(true);

    const payload = {
      title: this.form.title.trim(),
      year: Number(this.form.year),
      durationMinutes: Number(this.form.durationMinutes),
      unitCostBs: Number(this.form.unitCostBs),
      initialCopies: Number(this.form.initialCopies),
      genres: this.form.genresRaw.split(',').map((s) => s.trim()).filter(Boolean),
      alternativeTitles: this.form.alternativeTitlesRaw.split(',').map((s) => s.trim()).filter(Boolean),
      actors: this.form.actorsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      oscars: this.form.oscars.filter((o) => o.category.trim().length > 0),
    };

    this.api.post<{ movie: Movie }>('movies', payload).subscribe({
      next: () => {
        this.toast.success(`Película "${payload.title}" registrada exitosamente.`);
        this.closeForm();
        this.saving.set(false);
        this.loadMovies();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Error al registrar la película.');
      },
    });
  }

  openCopiesModal(movie: Movie): void {
    this.selectedMovie.set(movie);
    this.newCopiesCost = movie.unitCostBs || 15.0;
    this.newCopiesCount = 1;
    this.decommissionData = {
      copyId: '',
      date: new Date().toISOString().slice(0, 10),
      reason: 'not_returned',
      notes: '',
    };
    this.showCopiesModal.set(true);
  }

  closeCopiesModal(): void {
    this.showCopiesModal.set(false);
  }

  addNewCopies(): void {
    const movie = this.selectedMovie();
    if (!movie) return;

    this.api
      .post(`movies/${movie._id}/copies`, {
        quantity: Number(this.newCopiesCount),
      })
      .subscribe({
        next: () => {
          this.toast.success(`Se agregaron ${this.newCopiesCount} copia(s) a "${movie.title}".`);
          this.loadMovies();
          this.closeCopiesModal();
        },
        error: () => {
          this.toast.error('Error al agregar copias.');
        },
      });
  }

  submitDecommission(): void {
    if (!this.decommissionData.copyId) {
      this.toast.warning('Especifique el ID de la copia a dar de baja.');
      return;
    }

    this.api
      .patch(`copies/${this.decommissionData.copyId}/deactivate`, {
        reason: this.decommissionData.reason,
        notes: this.decommissionData.notes,
      })
      .subscribe({
        next: () => {
          this.toast.success('Baja de copia registrada exitosamente.');
          this.closeCopiesModal();
        },
        error: () => {
          this.toast.error('No se pudo registrar la baja de la copia.');
        },
      });
  }
}
