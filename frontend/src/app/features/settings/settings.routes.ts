import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-panel/settings-panel.component').then(
        (m) => m.SettingsPanelComponent,
      ),
  },
];
