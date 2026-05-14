import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { AdsService } from '../../core/services/ads.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad, AdsResponse, CompetitorAnalysis } from '../../core/models/ad.model';

export interface AdWithCompetitors {
  ad: Ad;
  analysis: CompetitorAnalysis | null;
  loadingCompetitors: boolean;
  status: 'above' | 'below' | 'equal' | 'unknown';
  diff: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly adsService = inject(AdsService);
  private readonly authService = inject(AuthService);

  loading = signal(true);
  loadingCompetitors = signal(false);
  data = signal<AdsResponse | null>(null);
  competitorRows = signal<AdWithCompetitors[]>([]);

  // KPIs
  total = computed(() => this.data()?.total ?? 0);
  activeAds = computed(() => this.data()?.ads.filter((a) => a.status === 'active').length ?? 0);
  pausedAds = computed(() => this.data()?.ads.filter((a) => a.status === 'paused').length ?? 0);
  totalStock = computed(
    () => this.data()?.ads.reduce((s, a) => s + (a.availableQuantity ?? 0), 0) ?? 0,
  );
  totalValue = computed(
    () => this.data()?.ads.reduce((s, a) => s + a.price * (a.availableQuantity ?? 0), 0) ?? 0,
  );

  // Sync stats
  synced = computed(() => this.data()?.ads.filter((a) => a.syncStatus === 'SYNCED').length ?? 0);
  pending = computed(() => this.data()?.ads.filter((a) => a.syncStatus === 'PENDING').length ?? 0);
  errors = computed(() => this.data()?.ads.filter((a) => a.syncStatus === 'ERROR').length ?? 0);
  conflicts = computed(
    () => this.data()?.ads.filter((a) => a.syncStatus === 'CONFLICT').length ?? 0,
  );
  syncedPct = computed(() => (this.total() ? (this.synced() / this.total()) * 100 : 0));
  pendingPct = computed(() => (this.total() ? (this.pending() / this.total()) * 100 : 0));
  errorPct = computed(() => (this.total() ? (this.errors() / this.total()) * 100 : 0));
  conflictPct = computed(() => (this.total() ? (this.conflicts() / this.total()) * 100 : 0));

  // Above/below avg competitor price
  adsAboveAvg = computed(() => this.competitorRows().filter((r) => r.status === 'above').length);
  adsBelowAvg = computed(() => this.competitorRows().filter((r) => r.status === 'below').length);

  competitorColumns = ['title', 'myPrice', 'minPrice', 'avgPrice', 'diff', 'action'];

  ngOnInit(): void {
    this.adsService.list({ limit: 500 }).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.loadTopCompetitors(res.ads);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTopCompetitors(ads: Ad[]): void {
    // Pega os 8 anúncios ativos e sincronizados para análise
    const targets = ads.filter((a) => a.status === 'active' && a.mlItemId).slice(0, 8);

    if (!targets.length) return;

    this.loadingCompetitors.set(true);

    // Inicializa as linhas como carregando
    this.competitorRows.set(
      targets.map((ad) => ({
        ad,
        analysis: null,
        loadingCompetitors: true,
        status: 'unknown',
        diff: null,
      })),
    );

    // Busca concorrentes de cada anúncio individualmente para evitar timeout
    targets.forEach((ad, idx) => {
      this.adsService.getCompetitors(ad._id).subscribe({
        next: (analysis) => {
          const status = this.calcStatus(ad.price, analysis.stats.avgPrice);
          const diff =
            analysis.stats.avgPrice !== null
              ? ((ad.price - analysis.stats.avgPrice) / analysis.stats.avgPrice) * 100
              : null;
          this.competitorRows.update((rows) =>
            rows.map((r, i) =>
              i === idx ? { ...r, analysis, loadingCompetitors: false, status, diff } : r,
            ),
          );
        },
        error: () => {
          this.competitorRows.update((rows) =>
            rows.map((r, i) =>
              i === idx ? { ...r, loadingCompetitors: false, status: 'unknown' } : r,
            ),
          );
        },
      });
    });

    this.loadingCompetitors.set(false);
  }

  private calcStatus(
    myPrice: number,
    avgPrice: number | null,
  ): 'above' | 'below' | 'equal' | 'unknown' {
    if (avgPrice === null) return 'unknown';
    const diff = ((myPrice - avgPrice) / avgPrice) * 100;
    if (diff > 5) return 'above';
    if (diff < -5) return 'below';
    return 'equal';
  }

  statusColor(status: string): string {
    switch (status) {
      case 'above':
        return 'text-red-500';
      case 'below':
        return 'text-green-600';
      case 'equal':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'above':
        return 'Acima da média';
      case 'below':
        return 'Abaixo da média';
      case 'equal':
        return 'Na média';
      default:
        return '—';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'above':
        return 'trending_up';
      case 'below':
        return 'trending_down';
      case 'equal':
        return 'remove';
      default:
        return 'help_outline';
    }
  }
}
