import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isCollapsed = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Películas', icon: '🎬', route: '/movies' },
    { label: 'Clientes', icon: '👥', route: '/customers' },
    { label: 'Préstamos', icon: '🎟️', route: '/rentals' },
    { label: 'Configuración', icon: '⚙️', route: '/settings' },
  ];

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }
}
