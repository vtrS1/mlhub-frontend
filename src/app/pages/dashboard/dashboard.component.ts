import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdsService } from '../../core/services/ads.service';
import { AuthService } from '../../core/services/auth.service';
import { AdsResponse } from '../../core/models/ad.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Vis&#227;o geral dos seus an&#250;ncios</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <p class="text-3xl font-bold text-gray-800">{{ data()?.total ?? 0 }}</p>
              <p class="text-sm text-gray-500 mt-1">Total de An&#250;ncios</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <p class="text-3xl font-bold text-green-600">{{ synced() }}</p>
              <p class="text-sm text-gray-500 mt-1">Sincronizados</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <p class="text-3xl font-bold text-yellow-500">{{ pending() }}</p>
              <p class="text-sm text-gray-500 mt-1">Pendentes</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="text-center">
            <mat-card-content class="py-6">
              <p class="text-3xl font-bold text-red-500">{{ errors() }}</p>
              <p class="text-sm text-gray-500 mt-1">Com Erro</p>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly adsService = inject(AdsService);
  private readonly authService = inject(AuthService);

  loading = signal(true);
  data = signal<AdsResponse | null>(null);
  synced = signal(0);
  pending = signal(0);
  errors = signal(0);

  ngOnInit(): void {
    this.adsService.list({ limit: 1000 }).subscribe({
      next: (res) => {
        this.data.set(res);
        this.synced.set(res.ads.filter((a) => a.syncStatus === 'SYNCED').length);
        this.pending.set(res.ads.filter((a) => a.syncStatus === 'PENDING').length);
        this.errors.set(res.ads.filter((a) => a.syncStatus === 'ERROR').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}