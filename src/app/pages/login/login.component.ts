import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <mat-card class="w-full max-w-sm shadow-lg">
        <mat-card-content class="flex flex-col items-center gap-6 py-10 px-8">
          <img
            src="/mlhub-logo.png"
            alt="ML Hub"
            class="h-20 w-auto object-contain"
          />
          <p class="text-sm text-gray-500 mt-1 text-center">Gerencie. Sincronize. Venda mais.</p>

          @if (redirecting()) {
            <div class="flex flex-col items-center gap-3">
              <mat-spinner diameter="36"></mat-spinner>
              <p class="text-sm text-gray-500">Redirecionando para o Mercado Livre...</p>
            </div>
          } @else {
            <button
              mat-flat-button
              class="w-full !bg-yellow-400 !text-gray-900 font-semibold text-base py-3"
              (click)="loginWithML()"
            >
              Entrar com Mercado Livre
            </button>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  redirecting = signal(false);

  loginWithML(): void {
    this.redirecting.set(true);
    window.location.href = `${environment.apiUrl}/auth/mercadolivre`;
  }
}
