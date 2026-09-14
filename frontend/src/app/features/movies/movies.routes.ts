import { Routes } from '@angular/router';

export const moviesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/movies-list/movies-list.component').then(
        (m) => m.MoviesListComponent,
      ),
  },
];
