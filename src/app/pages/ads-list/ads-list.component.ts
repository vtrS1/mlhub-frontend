import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdsService } from '../../core/services/ads.service';
import { Ad, AdsFilter } from '../../core/models/ad.model';

@Component({
  selector: 'app-ads-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Anúncios</h1>
          <p class="text-gray-500 text-sm mt-0.5">Gerencie seus anúncios do Mercado Livre</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button (click)="sync()" [disabled]="syncing()" class="!gap-1">
            <mat-icon [class.animate-spin]="syncing()">sync</mat-icon>
            {{ syncing() ? 'Sincronizando...' : 'Sincronizar' }}
          </button>
          <button
            mat-flat-button
            class="!bg-yellow-400 !text-gray-900 !font-semibold"
            routerLink="/ads/new"
          >
            <mat-icon>add</mat-icon> Novo Anúncio
          </button>
        </div>
      </div>

      <!-- Busca -->
      <mat-form-field appearance="outline" class="w-full mb-2">
        <mat-label>Buscar por título</mat-label>
        <input
          matInput
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          placeholder="Digite o título..."
        />
        <mat-icon matSuffix class="text-gray-400">search</mat-icon>
      </mat-form-field>

      <!-- Filtro de status -->
      <div class="flex gap-2 mb-6 flex-wrap">
        @for (f of statusFilters; track f.value) {
          <button
            mat-stroked-button
            [class.!bg-gray-800]="selectedStatus === f.value"
            [class.!text-white]="selectedStatus === f.value"
            [class.!border-gray-800]="selectedStatus === f.value"
            (click)="setStatus(f.value)"
          >
            {{ f.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="text-sm">Carregando anúncios...</span>
        </div>
      } @else if (ads().length === 0) {
        <div
          class="flex flex-col items-center justify-center py-24 text-gray-400 bg-gray-50 rounded-xl border border-dashed"
        >
          <mat-icon class="!text-5xl !w-12 !h-12 mb-3">inventory_2</mat-icon>
          <p class="font-medium">Nenhum anúncio encontrado</p>
          <p class="text-sm mt-1">Tente outro filtro ou crie um novo anúncio</p>
          <button
            mat-flat-button
            class="!bg-yellow-400 !text-gray-900 !font-semibold mt-4"
            routerLink="/ads/new"
          >
            <mat-icon>add</mat-icon> Criar primeiro anúncio
          </button>
        </div>
      } @else {
        <div class="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table mat-table [dataSource]="ads()" class="w-full !bg-white">
            <!-- Thumb -->
            <ng-container matColumnDef="thumbnail">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!w-16 !bg-gray-50 !border-b !border-gray-200"
              ></th>
              <td mat-cell *matCellDef="let ad" class="!w-16 !py-3 !pl-4">
                @if (ad.thumbnail && !ad.thumbnail.includes('[')) {
                  <img
                    [src]="ad.thumbnail"
                    [alt]="ad.title"
                    class="w-11 h-11 object-contain rounded-lg border border-gray-100 bg-gray-50"
                  />
                } @else {
                  <div
                    class="w-11 h-11 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"
                  >
                    <mat-icon class="text-gray-300">image_not_supported</mat-icon>
                  </div>
                }
              </td>
            </ng-container>

            <!-- Título + Código -->
            <ng-container matColumnDef="title">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!bg-gray-50 !border-b !border-gray-200 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide"
              >
                Anúncio
              </th>
              <td mat-cell *matCellDef="let ad" class="!py-3 !max-w-xs">
                <a
                  [routerLink]="['/ads', ad._id]"
                  class="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
                >
                  {{ ad.title }}
                </a>
                @if (ad.mlItemId) {
                  <a
                    [href]="ad.permalink"
                    target="_blank"
                    rel="noopener"
                    class="text-xs text-gray-400 font-mono hover:text-blue-500 mt-0.5 flex items-center gap-1 w-fit transition-colors"
                  >
                    <mat-icon class="!text-xs !w-3 !h-3">open_in_new</mat-icon>
                    {{ ad.mlItemId }}
                  </a>
                }
              </td>
            </ng-container>

            <!-- Preço -->
            <ng-container matColumnDef="price">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!bg-gray-50 !border-b !border-gray-200 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide"
              >
                Preço
              </th>
              <td
                mat-cell
                *matCellDef="let ad"
                class="!py-3 !font-semibold !text-gray-800 !whitespace-nowrap"
              >
                R$ {{ ad.price | number: '1.2-2' }}
              </td>
            </ng-container>

            <!-- Estoque -->
            <ng-container matColumnDef="stock">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!bg-gray-50 !border-b !border-gray-200 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide"
              >
                Estoque
              </th>
              <td mat-cell *matCellDef="let ad" class="!py-3">
                <span class="text-gray-800 font-medium">{{ ad.availableQuantity }}</span>
                <span class="text-gray-400 text-xs ml-1">un.</span>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!bg-gray-50 !border-b !border-gray-200 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide"
              >
                Status
              </th>
              <td mat-cell *matCellDef="let ad" class="!py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  [class]="statusClass(ad.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [class]="statusDotClass(ad.status)"></span>
                  {{ statusLabel(ad.status) }}
                </span>
              </td>
            </ng-container>

            <!-- Sync -->
            <ng-container matColumnDef="syncStatus">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!bg-gray-50 !border-b !border-gray-200 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide"
              >
                Sync
              </th>
              <td mat-cell *matCellDef="let ad" class="!py-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium"
                  [class]="syncClass(ad.syncStatus)"
                >
                  <mat-icon class="!text-xs !w-3 !h-3">{{ syncIcon(ad.syncStatus) }}</mat-icon>
                  {{ ad.syncStatus }}
                </span>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!w-16 !bg-gray-50 !border-b !border-gray-200"
              ></th>
              <td mat-cell *matCellDef="let ad" class="!py-3 !pr-4">
                <button
                  mat-icon-button
                  [routerLink]="['/ads', ad._id]"
                  class="!text-gray-400 hover:!text-gray-700 !transition-colors"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns" class="!h-10"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: columns"
              class="!border-b !border-gray-100 hover:!bg-blue-50/40 !transition-colors cursor-pointer"
              [routerLink]="['/ads', row._id]"
            ></tr>
          </table>
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="text-sm text-gray-400 pl-1"
            >{{ total() }} anúncio{{ total() !== 1 ? 's' : '' }} encontrado{{
              total() !== 1 ? 's' : ''
            }}</span
          >
          <mat-paginator
            [length]="total()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPage($event)"
            class="!bg-transparent"
          >
          </mat-paginator>
        </div>
      }
    </div>
  `,
})
export class AdsListComponent implements OnInit {
  private readonly adsService = inject(AdsService);
  private readonly snackBar = inject(MatSnackBar);

  columns = ['thumbnail', 'title', 'price', 'stock', 'status', 'syncStatus', 'actions'];
  loading = signal(true);
  syncing = signal(false);
  ads = signal<Ad[]>([]);
  total = signal(0);
  searchTerm = '';
  selectedStatus = '';
  page = 1;
  pageSize = 10;

  statusFilters = [
    { label: 'Todos', value: '', dot: 'bg-gray-400' },
    { label: 'Ativos', value: 'active', dot: 'bg-green-500' },
    { label: 'Pausados', value: 'paused', dot: 'bg-yellow-500' },
    { label: 'Encerrados', value: 'closed', dot: 'bg-red-500' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filter: AdsFilter = { page: this.page, limit: this.pageSize };
    if (this.searchTerm) filter['title'] = this.searchTerm;
    if (this.selectedStatus) filter['status'] = this.selectedStatus;
    this.adsService.list(filter).subscribe({
      next: (res) => {
        this.ads.set(res.ads);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  setStatus(status: string): void {
    this.selectedStatus = status;
    this.page = 1;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  sync(): void {
    this.syncing.set(true);
    this.adsService.sync().subscribe({
      next: () => {
        this.snackBar.open('Sincronização iniciada!', 'OK', { duration: 3000 });
        this.syncing.set(false);
        this.load();
      },
      error: () => {
        this.snackBar.open('Erro ao sincronizar', 'OK', { duration: 3000 });
        this.syncing.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      closed: 'Encerrado',
      under_review: 'Em revisão',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-green-50 text-green-700 border border-green-200',
      paused: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      closed: 'bg-red-50 text-red-600 border border-red-200',
      under_review: 'bg-blue-50 text-blue-700 border border-blue-200',
    };
    return map[status] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
  }

  statusDotClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      closed: 'bg-red-500',
      under_review: 'bg-blue-500',
    };
    return map[status] ?? 'bg-gray-400';
  }

  syncClass(status: string): string {
    const map: Record<string, string> = {
      SYNCED: 'bg-emerald-50 text-emerald-700',
      PENDING: 'bg-amber-50 text-amber-700',
      ERROR: 'bg-red-50 text-red-600',
      CONFLICT: 'bg-orange-50 text-orange-700',
    };
    return map[status] ?? 'bg-gray-50 text-gray-500';
  }

  syncIcon(status: string): string {
    const map: Record<string, string> = {
      SYNCED: 'check_circle',
      PENDING: 'schedule',
      ERROR: 'error',
      CONFLICT: 'warning',
    };
    return map[status] ?? 'help';
  }
}
