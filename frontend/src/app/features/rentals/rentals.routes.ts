import { Routes } from '@angular/router';

export const rentalsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pos-terminal/pos-terminal.component').then(
        (m) => m.PosTerminalComponent,
      ),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/rentals-history/rentals-history.component').then(
        (m) => m.RentalsHistoryComponent,
      ),
  },
];
