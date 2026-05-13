import { Component, OnInit, inject, signal, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdsService } from '../../core/services/ads.service';
import { Ad } from '../../core/models/ad.model';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/ads"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Editar An&#250;ncio</h1>
          <p class="text-sm text-gray-500">Atualize os dados do seu an&#250;ncio</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="40"></mat-spinner></div>

      } @else if (ad()) {

        <!-- Cabe&#231;alho do an&#250;ncio -->
        <div class="flex gap-4 items-center mb-6 p-4 bg-white rounded-xl border border-gray-200">
          <img [src]="ad()!.thumbnail" [alt]="ad()!.title" class="w-16 h-16 object-contain rounded border bg-gray-50 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ ad()!.title }}</p>
            <a [href]="ad()!.permalink" target="_blank" class="text-blue-500 text-xs hover:underline">
              Ver no Mercado Livre &#8599;
            </a>
          </div>
          <div class="flex flex-col gap-1 items-end shrink-0">
            <span [class]="statusClass(ad()!.status)">{{ statusLabel(ad()!.status) }}</span>
            <span [class]="syncClass(ad()!.syncStatus)">{{ ad()!.syncStatus }}</span>
          </div>
        </div>

        <!-- Se&#231;&#227;o: Informa&#231;&#245;es -->
        <mat-card class="mb-4">
          <mat-card-content class="flex flex-col gap-4 py-5">
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Informa&#231;&#245;es</p>

            <mat-form-field appearance="outline">
              <mat-label>T&#237;tulo</mat-label>
              <input matInput [(ngModel)]="editTitle" maxlength="60" />
              <mat-hint align="end">{{ editTitle.length }}/60</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Descri&#231;&#227;o</mat-label>
              <textarea matInput [(ngModel)]="editDescription" rows="3"></textarea>
            </mat-form-field>

            <button
              mat-flat-button
              class="!bg-gray-800 !text-white"
              (click)="updateInfo()"
              [disabled]="saving()"
            >
              <mat-icon>save</mat-icon>
              Salvar Informa&#231;&#245;es
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Se&#231;&#227;o: Pre&#231;o e Estoque -->
        <mat-card class="mb-4">
          <mat-card-content class="flex flex-col gap-4 py-5">
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pre&#231;o e Estoque</p>

            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Pre&#231;o (R$)</mat-label>
                <input matInput type="number" min="0.01" step="0.01" [(ngModel)]="newPrice" />
                <span matTextPrefix>R$&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estoque</mat-label>
                <input matInput type="number" min="1" step="1" [(ngModel)]="newStock" />
                <span matTextSuffix>&nbsp;un.</span>
              </mat-form-field>
            </div>

            <div class="flex gap-3">
              <button mat-flat-button class="flex-1 !bg-yellow-400 !text-gray-900" (click)="updatePrice()" [disabled]="saving()">
                Atualizar Pre&#231;o
              </button>
              <button mat-flat-button class="flex-1 !bg-yellow-400 !text-gray-900" (click)="updateStock()" [disabled]="saving()">
                Atualizar Estoque
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Se&#231;&#227;o: Status -->
        <mat-card>
          <mat-card-content class="flex flex-col gap-3 py-5">
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status do An&#250;ncio</p>
            <div class="flex gap-3">
              @if (ad()!.status === 'active') {
                <button mat-stroked-button color="warn" (click)="pause()" [disabled]="saving()">
                  <mat-icon>pause</mat-icon> Pausar an&#250;ncio
                </button>
              } @else if (ad()!.status === 'paused') {
                <button mat-flat-button color="primary" (click)="activate()" [disabled]="saving()">
                  <mat-icon>play_arrow</mat-icon> Reativar an&#250;ncio
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>

      }
    </div>
  `,
})
export class AdDetailComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly adsService = inject(AdsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  ad = signal<Ad | null>(null);

  newPrice: number = 0;
  newStock: number = 1;
  editTitle: string = '';
  editDescription: string = '';

  ngOnInit(): void {
    this.adsService.getById(this.id()).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.newPrice = ad.price;
        this.newStock = ad.availableQuantity;
        this.editTitle = ad.title;
        this.editDescription = ad.description ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('An&#250;ncio n&#227;o encontrado', 'OK', { duration: 3000 });
        this.router.navigate(['/ads']);
      },
    });
  }

  updateInfo(): void {
    this.saving.set(true);
    this.adsService.update(this.id(), { title: this.editTitle, description: this.editDescription }).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.snackBar.open('Informa&#231;&#245;es atualizadas!', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  updatePrice(): void {
    if (this.newPrice <= 0) return;
    this.saving.set(true);
    this.adsService.updatePrice(this.id(), { price: this.newPrice }).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.snackBar.open('Pre&#231;o atualizado!', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar pre&#231;o', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  updateStock(): void {
    if (this.newStock < 1) return;
    this.saving.set(true);
    this.adsService.updateStock(this.id(), { availableQuantity: this.newStock }).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.snackBar.open('Estoque atualizado!', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar estoque', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  pause(): void {
    this.saving.set(true);
    this.adsService.pause(this.id()).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.snackBar.open('An&#250;ncio pausado', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao pausar', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  activate(): void {
    this.saving.set(true);
    this.adsService.activate(this.id()).subscribe({
      next: (ad) => {
        this.ad.set(ad);
        this.snackBar.open('An&#250;ncio ativado', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao ativar', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { active: 'Ativo', paused: 'Pausado', closed: 'Encerrado' };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'px-2 py-1 rounded text-xs bg-green-100 text-green-700 font-medium',
      paused: 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 font-medium',
      closed: 'px-2 py-1 rounded text-xs bg-red-100 text-red-700 font-medium',
    };
    return map[status] ?? 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 font-medium';
  }

  syncClass(status: string): string {
    const map: Record<string, string> = {
      SYNCED: 'px-2 py-1 rounded text-xs bg-green-50 text-green-600',
      PENDING: 'px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-600',
      ERROR: 'px-2 py-1 rounded text-xs bg-red-50 text-red-600',
      CONFLICT: 'px-2 py-1 rounded text-xs bg-orange-50 text-orange-600',
    };
    return map[status] ?? 'px-2 py-1 rounded text-xs bg-gray-50 text-gray-600';
  }
}