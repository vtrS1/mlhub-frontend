import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdsService } from '../../core/services/ads.service';
import { CreateAdDto, MLCategoryAttribute, MLCategoryDetails } from '../../core/models/ad.model';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [
    RouterLink, FormsModule, NgTemplateOutlet,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, MatDividerModule,
    MatSlideToggleModule, MatExpansionModule,
  ],
  templateUrl: './ad-create.component.html',
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
  pictureUrls = signal<string[]>(['']);

  form: Omit<CreateAdDto, 'pictureUrls' | 'attributes'> = {
    title: '', description: '', price: 0, availableQuantity: 1,
    categoryId: '', condition: 'new', listingTypeId: 'gold_special',
    warrantyType: 'Garantia do vendedor', warrantyTime: '90 dias',
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
  requiredAttributes = computed(() =>
    this.categoryAttributes().filter((a) => a.tags.required || a.tags.catalog_required));
  optionalAttributes = computed(() =>
    this.categoryAttributes().filter((a) => !a.tags.required && !a.tags.catalog_required));
  filledRequiredCount = computed(() =>
    this.requiredAttributes().filter((a) => this.attributeValues()[a.id]?.trim()).length);
  validPictures = computed(() => this.pictureUrls().filter((u: string) => u.trim().length > 0));

  ngOnInit(): void {
    this.adsService.getCategories().subscribe({
      next: (cats) => this.rootCategories.set(cats),
      error: () => this.snackBar.open('Erro ao carregar categorias', 'OK', { duration: 3000 }),
    });
  }

  selectCategory(id: string): void {
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
      error: () => { this.snackBar.open('Erro ao carregar categoria', 'OK', { duration: 3000 }); this.loadingCategoryDetails.set(false); },
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
        // Ocultar apenas atributos gerados automaticamente ou somente leitura
        // GTIN deve aparecer pois é obrigatório em algumas categorias (ex: eletrônicos)
        // business_conditional: o ML gerencia automaticamente, enviar causa erro
        const ALWAYS_SKIP = ['SELLER_SKU', 'MPN', 'EAN', 'UPC', 'ISBN'];
        this.categoryAttributes.set(
          attrs.filter((a) =>
            !ALWAYS_SKIP.includes(a.id) &&
            !a.tags.hidden &&
            !a.tags.read_only &&
            !(a.tags as Record<string, unknown>)['business_conditional']
          )
        );
        this.loadingAttributes.set(false);
      },
      error: () => this.loadingAttributes.set(false),
    });
  }

  getAttributeValue(attrId: string): string { return this.attributeValues()[attrId] ?? ''; }
  setAttributeValue(attrId: string, value: string): void { this.attributeValues.update((p) => ({ ...p, [attrId]: value ?? '' })); }
  getAttributeNumber(attrId: string): string { return this.attributeValues()[attrId]?.split(' ')[0] ?? ''; }
  getAttributeUnit(attrId: string, attr: MLCategoryAttribute): string {
    const parts = (this.attributeValues()[attrId] ?? '').split(' ');
    return parts.length >= 2 ? parts[1] : (attr.default_unit ?? attr.allowed_units?.[0]?.id ?? '');
  }
  setAttributeNumber(attrId: string, num: string | number, unit: string): void {
    const value = num !== null && num !== undefined && String(num).trim() !== '' ? `${num} ${unit}` : '';
    this.attributeValues.update((p) => ({ ...p, [attrId]: value }));
  }

  setPictureUrl(index: number, value: string): void {
    this.pictureUrls.update((arr) => { const c = [...arr]; c[index] = value; return c; });
  }
  onImageError(index: number): void {
    this.setPictureUrl(index, '');
    this.snackBar.open(`URL da imagem ${index + 1} invalida ou inacessivel`, 'OK', { duration: 3000 });
  }
  addImage(): void { if (this.pictureUrls().length < 6) this.pictureUrls.update((arr) => [...arr, '']); }
  removeImage(i: number): void { this.pictureUrls.update((arr) => arr.filter((_, idx) => idx !== i)); }

  fillTestData(): void {
    this.form = { title: 'Item de Teste - Nao Comprar', description: 'Produto criado para fins de teste.', price: 10, availableQuantity: 1, categoryId: 'MLB3530', condition: 'new', listingTypeId: 'gold_special', warrantyType: 'Garantia do vendedor', warrantyTime: '90 dias' };
    this.pictureUrls.set(['https://www.motorino.com.br/site/wp-content/uploads/2018/01/produto_de_teste_amarelo_4_2_20171020224326-400x400.jpg']);
    this.loadingCategoryDetails.set(true);
    this.adsService.getCategoryDetails('MLB3530').subscribe({
      next: (details) => { this.currentCategoryDetails.set(details); this.loadingCategoryDetails.set(false); this.loadCategoryAttributes('MLB3530'); this.attributeValues.set({ BRAND: 'Generica' }); },
      error: () => this.loadingCategoryDetails.set(false),
    });
    this.snackBar.open('Dados de teste preenchidos!', 'OK', { duration: 2000 });
  }

  isValid(): boolean { return this.validationErrors().length === 0; }
  validationErrors(): string[] {
    const errors: string[] = [];
    if (this.form.title.trim().length < 10) errors.push('Titulo deve ter ao menos 10 caracteres');
    if (this.form.price <= 0) errors.push('Preco deve ser maior que zero');
    if (this.form.availableQuantity < 1) errors.push('Estoque deve ser ao menos 1');
    if (!this.form.categoryId) errors.push('Selecione uma categoria');
    if (this.form.categoryId && !this.isLeafCategory() && this.currentCategoryDetails() !== null) errors.push('Navegue ate uma subcategoria');
    if (this.validPictures().length === 0) errors.push('Adicione ao menos uma imagem');
    for (const attr of this.requiredAttributes()) {
      if (!this.attributeValues()[attr.id]?.trim()) errors.push(`Campo obrigatorio: ${attr.name}`);
    }
    return errors;
  }

  submit(): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const attributes = Object.entries(this.attributeValues()).filter(([, v]) => v.trim().length > 0).map(([id, value_name]) => ({ id, value_name }));
    const dto: CreateAdDto = { ...this.form, attributes, pictureUrls: this.validPictures() };
    this.adsService.create(dto).subscribe({
      next: (ad) => { this.snackBar.open('Anuncio publicado com sucesso!', 'OK', { duration: 4000 }); this.router.navigate(['/ads', ad._id]); },
      error: (err) => { this.snackBar.open(err?.error?.message ?? 'Erro ao publicar', 'Fechar', { duration: 7000 }); this.saving.set(false); },
    });
  }
}
