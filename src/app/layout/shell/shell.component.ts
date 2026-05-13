import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">

        <!-- Logo -->
        <div class="flex items-center justify-center px-4 py-5 border-b border-gray-100">
          <img
            src="/mlhub-logo.png"
            alt="ML Hub"
            class="h-14 w-auto object-contain"
          />
        </div>

        <!-- Nav -->
        <nav class="flex flex-col gap-1 px-3 py-4 flex-1">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-yellow-50 text-yellow-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              <mat-icon class="!text-[20px] shrink-0">{{ item.icon }}</mat-icon>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Footer / Logout -->
        <div class="px-3 py-4 border-t border-gray-100">
          <button
            mat-button
            class="w-full !justify-start !text-gray-500 hover:!text-red-500"
            (click)="logout()"
          >
            <mat-icon class="!text-[20px] mr-2">logout</mat-icon>
            Sair
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Anúncios', icon: 'inventory_2', route: '/ads' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
