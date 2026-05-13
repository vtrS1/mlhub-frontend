import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AdsService } from '../../core/services/ads.service';
import { CreateAdDto, MLCategoryAttribute, MLCategoryDetails } from '../../core/models/ad.model';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">

      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/ads"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Novo An&#250;ncio</h1>
          <p class="text-sm text-gray-500">Preencha os dados para publicar no Mercado Livre</p>
        </div>
      </div>

      <mat-card>
        <mat-card-content class="flex flex-col gap-5 py-6 px-2">

          <div class="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
            <div class="flex items-center gap-2 text-amber-800">
              <mat-icon class="text-amber-500">science</mat-icon>
              <span class="text-sm font-medium">Ambiente de Homologa&#231;&#227;o (ML Test)</span>
            </div>
            <button mat-stroked-button color="accent" (click)="fillTestData()" type="button">
              <mat-icon>auto_fix_high</mat-icon>
              Preencher dados de teste
            </button>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>T&#237;tulo do an&#250;ncio *</mat-label>
            <input matInput [(ngModel)]="form.title" maxlength="60" placeholder="Ex: Notebook Dell Inspiron 15 8GB RAM" />
            <mat-hint align="end">{{ form.title.length }}/60 (m&#237;n. 10)</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descri&#231;&#227;o</mat-label>
            <textarea matInput [(ngModel)]="form.description" rows="4" placeholder="Descreva o produto em detalhes..."></textarea>
          </mat-form-field>

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Pre&#231;o (R$) *</mat-label>
              <input matInput type="number" min="0.01" step="0.01" [(ngModel)]="form.price" placeholder="0,00" />
              <span matTextPrefix>R$&nbsp;</span>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estoque *</mat-label>
              <input matInput type="number" min="1" step="1" [(ngModel)]="form.availableQuantity" placeholder="1" />
              <span matTextSuffix>&nbsp;un.</span>
            </mat-form-field>
          </div>

          <!-- Categoria -->
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium text-gray-700">Categoria *</p>

            @if (categoryPath().length > 0) {
              <div class="flex items-center flex-wrap gap-1 text-sm mb-1">
                <button mat-button class="!min-w-0 !px-1 !text-blue-600 text-xs" (click)="resetCategory()">In&#237;cio</button>
                @for (crumb of categoryPath(); track crumb.id; let last = $last) {
                  <mat-icon class="!text-base text-gray-400">chevron_right</mat-icon>
                  @if (!last) {
                    <button mat-button class="!min-w-0 !px-1 !text-blue-600 text-xs" (click)="navigateToCrumb(crumb.id)">{{ crumb.name }}</button>
                  } @else {
                    <span class="font-semibold text-gray-800 text-xs">{{ crumb.name }}</span>
                  }
                }
              </div>
            }

            @if (loadingCategoryDetails()) {
              <div class="flex items-center gap-2 text-sm text-gray-500 py-2">
                <mat-spinner diameter="18"></mat-spinner> Carregando categorias...
              </div>
            } @else if (currentSubcategories().length > 0) {
              <div class="grid grid-cols-2 gap-2">
                @for (sub of currentSubcategories(); track sub.id) {
                  <button
                    mat-stroked-button
                    class="!justify-start !text-left !text-sm !h-auto !py-2 !px-3"
                    [class.!border-yellow-400]="form.categoryId === sub.id"
                    [class.!bg-yellow-50]="form.categoryId === sub.id"
                    (click)="selectCategory(sub.id, sub.name)"
                  >
                    <mat-icon class="!text-base mr-1">{{ form.categoryId === sub.id ? 'check_circle' : 'folder' }}</mat-icon>
                    {{ sub.name }}
                  </button>
                }
              </div>
              @if (form.categoryId && isLeafCategory()) {
                <div class="flex items-center gap-2 mt-1 text-green-700 text-sm">
                  <mat-icon class="!text-base">check_circle</mat-icon>
                  Categoria folha selecionada
                </div>
              }
            } @else if (form.categoryId && isLeafCategory()) {
              <div class="flex items-center gap-2 text-green-700 text-sm">
                <mat-icon class="!text-base">check_circle</mat-icon>
                <span class="font-medium">{{ categoryPath()[categoryPath().length - 1]?.name }}</span>
                <button mat-icon-button class="!w-6 !h-6" matTooltip="Trocar categoria" (click)="resetCategory()">
                  <mat-icon class="!text-base">edit</mat-icon>
                </button>
              </div>
            }
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Condi&#231;&#227;o *</mat-label>
            <mat-select [(ngModel)]="form.condition">
              <mat-option value="new">Novo</mat-option>
              <mat-option value="used">Usado</mat-option>
              <mat-option value="not_specified">N&#227;o especificado</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de publica&#231;&#227;o *</mat-label>
            <mat-select [(ngModel)]="form.listingTypeId">
              <mat-option value="gold_special">Cl&#225;ssico (recomendado)</mat-option>
              <mat-option value="gold_pro">Premium</mat-option>
              <mat-option value="free">Gr&#225;tis</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Tipo de garantia</mat-label>
              <mat-select [(ngModel)]="form.warrantyType">
                <mat-option value="Garantia do vendedor">Garantia do vendedor</mat-option>
                <mat-option value="Garantia de fábrica">Garantia de f&#225;brica</mat-option>
                <mat-option value="Sem garantia">Sem garantia</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Prazo de garantia</mat-label>
              <mat-select [(ngModel)]="form.warrantyTime">
                <mat-option value="30 dias">30 dias</mat-option>
                <mat-option value="90 dias">90 dias</mat-option>
                <mat-option value="6 meses">6 meses</mat-option>
                <mat-option value="1 ano">1 ano</mat-option>
                <mat-option value="2 anos">2 anos</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Atributos dinâmicos -->
          @if (loadingAttributes()) {
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <mat-spinner diameter="18"></mat-spinner> Carregando atributos da categoria...
            </div>
          } @else if (categoryAttributes().length > 0) {
            <mat-divider></mat-divider>
            <p class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <mat-icon class="!text-base text-blue-500">tune</mat-icon>
              Atributos da categoria
            </p>
            <div class="flex flex-col gap-4">
              @for (attr of categoryAttributes(); track attr.id) {
                @if (attr.value_type === 'list' && attr.values && attr.values.length > 0) {
                  <mat-form-field appearance="outline">
                    <mat-label>{{ attr.name }}@if (attr.tags.required || attr.tags.catalog_required) { <span class="text-red-500"> *</span> }</mat-label>
                    <mat-select [ngModel]="getAttributeValue(attr.id)" (ngModelChange)="setAttributeValue(attr.id, $event)">
                      <mat-option value="">&#8212; N&#227;o informado &#8212;</mat-option>
                      @for (val of attr.values; track val.id) {
                        <mat-option [value]="val.name">{{ val.name }}</mat-option>
                      }
                    </mat-select>
                    @if (attr.hint) { <mat-hint>{{ attr.hint }}</mat-hint> }
                  </mat-form-field>
                } @else {
                  <mat-form-field appearance="outline">
                    <mat-label>{{ attr.name }}@if (attr.tags.required || attr.tags.catalog_required) { <span class="text-red-500"> *</span> }</mat-label>
                    <input
                      matInput
                      [type]="attr.value_type === 'number' || attr.value_type === 'number_unit' ? 'number' : 'text'"
                      [placeholder]="attr.hint ?? attr.name"
                      [ngModel]="getAttributeValue(attr.id)"
                      (ngModelChange)="setAttributeValue(attr.id, $event)"
                    />
                    @if (attr.allowed_units && attr.allowed_units.length > 0) {
                      <mat-hint>Unidade: {{ attr.default_unit ?? attr.allowed_units[0].name }}</mat-hint>
                    }
                  </mat-form-field>
                }
              }
            </div>
          }

          <!-- Imagens -->
          <mat-divider></mat-divider>
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Imagens do produto * (ao menos 1)</p>
            @for (url of pictureUrls; track $index) {
              <div class="flex gap-2 mb-2 items-center">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>URL da imagem {{ $index + 1 }}</mat-label>
                  <input matInput [(ngModel)]="pictureUrls[$index]" placeholder="https://..." />
                </mat-form-field>
                @if ($index > 0) {
                  <button mat-icon-button color="warn" (click)="removeImage($index)"><mat-icon>delete</mat-icon></button>
                }
              </div>
            }
            <button mat-stroked-button (click)="addImage()" [disabled]="pictureUrls.length >= 6">
              <mat-icon>add_photo_alternate</mat-icon> Adicionar imagem
            </button>
          </div>

          <div class="flex gap-3 pt-2">
            <span class="flex-1" [matTooltip]="validationErrors().join(' • ')" [matTooltipDisabled]="isValid()">
              <button mat-flat-button class="w-full !bg-yellow-400 !text-gray-900 font-semibold" (click)="submit()" [disabled]="saving() || !isValid()">
                @if (saving()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner> Publicando...
                } @else {
                  <ng-container>
                    <mat-icon>publish</mat-icon> Publicar An&#250;ncio
                  </ng-container>
                }
              </button>
            </span>
            <button mat-stroked-button routerLink="/ads" [disabled]="saving()">Cancelar</button>
          </div>

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AdCreateComponent implements OnInit {
  private readonly adsService = inject(AdsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  saving = signal(false);
  loadingCategoryDetails = signal(false);
  loadingAttributes = signal(false);
  rootCategories = signal<{ id: string; name: string }[]>([]);
  currentCategoryDetails = signal<MLCategoryDetails | null>(null);
  categoryAttributes = signal<MLCategoryAttribute[]>([]);
  private attributeValues = signal<Record<string, string>>({});
  pictureUrls: string[] = [''];

  form: Omit<CreateAdDto, 'pictureUrls' | 'attributes'> = {
    title: '',
    description: '',
    price: 0,
    availableQuantity: 1,
    categoryId: '',
    condition: 'new',
    listingTypeId: 'gold_special',
    warrantyType: 'Garantia do vendedor',
    warrantyTime: '90 dias',
  };

  currentSubcategories = computed(() => {
    const d = this.currentCategoryDetails();
    return d ? d.children_categories : this.rootCategories();
  });

  categoryPath = computed(() => this.currentCategoryDetails()?.path_from_root ?? []);

  isLeafCategory = computed(() => {
    const d = this.currentCategoryDetails();
    return !!d && d.children_categories.length === 0;
  });

  ngOnInit(): void {
    this.adsService.getCategories().subscribe({
      next: (cats) => this.rootCategories.set(cats),
      error: () => this.snackBar.open('Erro ao carregar categorias', 'OK', { duration: 3000 }),
    });
  }

  selectCategory(id: string, _name: string): void {
    this.form.categoryId = id;
    this.categoryAttributes.set([]);
    this.attributeValues.set({});
    this.loadingCategoryDetails.set(true);
    this.adsService.getCategoryDetails(id).subscribe({
      next: (details) => {
        this.currentCategoryDetails.set(details);
        this.loadingCategoryDetails.set(false);
        if (details.children_categories.length === 0) this.loadCategoryAttributes(id);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar detalhes da categoria', 'OK', { duration: 3000 });
        this.loadingCategoryDetails.set(false);
      },
    });
  }

  navigateToCrumb(categoryId: string): void {
    this.form.categoryId = categoryId;
    this.categoryAttributes.set([]);
    this.attributeValues.set({});
    this.loadingCategoryDetails.set(true);
    this.adsService.getCategoryDetails(categoryId).subscribe({
      next: (d) => { this.currentCategoryDetails.set(d); this.loadingCategoryDetails.set(false); },
      error: () => this.loadingCategoryDetails.set(false),
    });
  }

  resetCategory(): void {
    this.form.categoryId = '';
    this.currentCategoryDetails.set(null);
    this.categoryAttributes.set([]);
    this.attributeValues.set({});
  }

  private loadCategoryAttributes(categoryId: string): void {
    this.loadingAttributes.set(true);
    this.adsService.getCategoryAttributes(categoryId).subscribe({
      next: (attrs) => {
        const req = attrs.filter((a) => a.tags.required || a.tags.catalog_required);
        const opt = attrs.filter((a) => !a.tags.required && !a.tags.catalog_required).slice(0, 5);
        this.categoryAttributes.set([...req, ...opt]);
        this.loadingAttributes.set(false);
      },
      error: () => this.loadingAttributes.set(false),
    });
  }

  getAttributeValue(attrId: string): string {
    return this.attributeValues()[attrId] ?? '';
  }

  setAttributeValue(attrId: string, value: string): void {
    this.attributeValues.update((prev) => ({ ...prev, [attrId]: value }));
  }

  fillTestData(): void {
    this.form = {
      title: 'Item de Teste - Não Comprar',
      description: 'Produto criado para fins de teste em ambiente de homologação.',
      price: 10,
      availableQuantity: 1,
      categoryId: 'MLB3530',
      condition: 'new',
      listingTypeId: 'gold_special',
      warrantyType: 'Garantia do vendedor',
      warrantyTime: '90 dias',
    };
    this.pictureUrls = [
      'https://www.motorino.com.br/site/wp-content/uploads/2018/01/produto_de_teste_amarelo_4_2_20171020224326-400x400.jpg',
    ];
    this.loadingCategoryDetails.set(true);
    this.adsService.getCategoryDetails('MLB3530').subscribe({
      next: (details) => {
        this.currentCategoryDetails.set(details);
        this.loadingCategoryDetails.set(false);
        this.loadCategoryAttributes('MLB3530');
        this.attributeValues.set({ BRAND: 'Genérica' });
      },
      error: () => this.loadingCategoryDetails.set(false),
    });
    this.snackBar.open('Dados de teste preenchidos!', 'OK', { duration: 2000 });
  }

  addImage(): void {
    if (this.pictureUrls.length < 6) this.pictureUrls.push('');
  }

  removeImage(i: number): void {
    this.pictureUrls.splice(i, 1);
  }

  isValid(): boolean {
    return this.validationErrors().length === 0;
  }

  validationErrors(): string[] {
    const errors: string[] = [];
    if (this.form.title.trim().length < 10) errors.push('Título deve ter ao menos 10 caracteres');
    if (this.form.price <= 0) errors.push('Preço deve ser maior que zero');
    if (this.form.availableQuantity < 1) errors.push('Estoque deve ser ao menos 1');
    if (!this.form.categoryId) errors.push('Selecione uma categoria');
    if (this.form.categoryId && !this.isLeafCategory() && this.currentCategoryDetails() !== null) {
      errors.push('Navegue até uma subcategoria para publicar');
    }
    for (const attr of this.categoryAttributes().filter((a) => a.tags.required || a.tags.catalog_required)) {
      if (!this.attributeValues()[attr.id]?.trim()) errors.push(`Campo obrigatório: ${attr.name}`);
    }
    return errors;
  }

  submit(): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const attributes = Object.entries(this.attributeValues())
      .filter(([, v]) => v.trim().length > 0)
      .map(([id, value_name]) => ({ id, value_name }));
    const dto: CreateAdDto = {
      ...this.form,
      attributes,
      pictureUrls: this.pictureUrls.filter((u) => u.trim().length > 0),
    };
    this.adsService.create(dto).subscribe({
      next: (ad) => {
        this.snackBar.open('Anúncio publicado com sucesso!', 'OK', { duration: 4000 });
        this.router.navigate(['/ads', ad._id]);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Erro ao publicar anúncio';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }
}
