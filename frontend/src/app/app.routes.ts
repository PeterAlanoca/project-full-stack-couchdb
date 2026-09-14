import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'movies',
        loadChildren: () =>
          import('./features/movies/movies.routes').then((m) => m.moviesRoutes),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then(
            (m) => m.customersRoutes,
          ),
      },
      {
        path: 'rentals',
        loadChildren: () =>
          import('./features/rentals/rentals.routes').then(
            (m) => m.rentalsRoutes,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(
            (m) => m.settingsRoutes,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
