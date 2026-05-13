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
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Anúncios</h1>
          <p class="text-gray-500 text-sm">Gerencie todos os seus anúncios do Mercado Livre</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button (click)="sync()" [disabled]="syncing()">
            <mat-icon>sync</mat-icon>
            {{ syncing() ? 'Sincronizando...' : 'Sincronizar' }}
          </button>
          <button mat-flat-button class="!bg-yellow-400 !text-gray-900 font-semibold" routerLink="/ads/new">
            <mat-icon>add</mat-icon>
            Novo An&#250;ncio
          </button>
        </div>
      </div>

      <mat-form-field appearance="outline" class="w-full mb-2">
        <mat-label>Buscar por t&#237;tulo</mat-label>
        <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Digite o t&#237;tulo..." />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <!-- Filtro de status -->
      <div class="flex gap-2 mb-6 flex-wrap">
        @for (f of statusFilters; track f.value) {
          <button
            mat-stroked-button
            [class]="selectedStatus === f.value ? '!bg-gray-800 !text-white !border-gray-800' : ''"
            (click)="setStatus(f.value)"
          >{{ f.label }}</button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (ads().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <mat-icon class="text-5xl">inventory_2</mat-icon>
          <p class="mt-2">Nenhum anúncio encontrado</p>
        </div>
      } @else {
        <div class="overflow-x-auto rounded border">
          <table mat-table [dataSource]="ads()" class="w-full">
            <ng-container matColumnDef="thumbnail">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let ad">
                <img [src]="ad.thumbnail" [alt]="ad.title" class="w-12 h-12 object-contain rounded" />
              </td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Título</th>
              <td mat-cell *matCellDef="let ad">
                <a [routerLink]="['/ads', ad._id]" class="text-blue-600 hover:underline font-medium">
                  {{ ad.title }}
                </a>
              </td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Preço</th>
              <td mat-cell *matCellDef="let ad">R$ {{ ad.price | number:'1.2-2' }}</td>
            </ng-container>
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Estoque</th>
              <td mat-cell *matCellDef="let ad">{{ ad.availableQuantity }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let ad">
                <span [class]="statusClass(ad.status)">{{ statusLabel(ad.status) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="syncStatus">
              <th mat-header-cell *matHeaderCellDef>Sync</th>
              <td mat-cell *matCellDef="let ad">
                <span [class]="syncClass(ad.syncStatus)">{{ ad.syncStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let ad">
                <button mat-icon-button [routerLink]="['/ads', ad._id]">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
        ></mat-paginator>
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
    { label: 'Todos', value: '' },
    { label: 'Ativos', value: 'active' },
    { label: 'Pausados', value: 'paused' },
    { label: 'Encerrados', value: 'closed' },
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
    const map: Record<string, string> = { active: 'Ativo', paused: 'Pausado', closed: 'Encerrado' };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'px-2 py-1 rounded text-xs bg-green-100 text-green-700',
      paused: 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700',
      closed: 'px-2 py-1 rounded text-xs bg-red-100 text-red-700',
    };
    return map[status] ?? 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-700';
  }

  syncClass(status: string): string {
    const map: Record<string, string> = {
      SYNCED: 'px-2 py-1 rounded text-xs bg-green-100 text-green-700',
      PENDING: 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700',
      ERROR: 'px-2 py-1 rounded text-xs bg-red-100 text-red-700',
      CONFLICT: 'px-2 py-1 rounded text-xs bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-700';
  }
}
