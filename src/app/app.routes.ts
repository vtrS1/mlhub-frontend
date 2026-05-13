import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'ads',
        loadComponent: () =>
          import('./pages/ads-list/ads-list.component').then(
            (m) => m.AdsListComponent
          ),
      },
      {
        path: 'ads/new',
        loadComponent: () =>
          import('./pages/ad-create/ad-create.component').then(
            (m) => m.AdCreateComponent
          ),
      },
      {
        path: 'ads/:id',
        loadComponent: () =>
          import('./pages/ad-detail/ad-detail.component').then(
            (m) => m.AdDetailComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
