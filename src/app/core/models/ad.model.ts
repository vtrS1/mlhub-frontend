export interface Ad {
  _id: string;
  sellerId: string;
  mlItemId: string;
  title: string;
  description: string;
  price: number;
  availableQuantity: number;
  status: AdStatus;
  thumbnail: string;
  permalink: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}

export type AdStatus = 'active' | 'paused' | 'closed';

export type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR' | 'CONFLICT';

export interface AdsResponse {
  ads: Ad[];
  total: number;
}

export interface AdsFilter {
  page?: number;
  limit?: number;
  status?: string;
  title?: string;
}

/** Valor possível de um atributo de categoria */
export interface MLAttributeValue {
  id: string;
  name: string;
}

/** Definição de um atributo retornado pela API do ML para uma categoria folha */
export interface MLCategoryAttribute {
  id: string;
  name: string;
  value_type: 'string' | 'number' | 'boolean' | 'list' | 'number_unit';
  tags: {
    required?: boolean;
    catalog_required?: boolean;
    hidden?: boolean;
    read_only?: boolean;
    multivalued?: boolean;
    variation_attribute?: boolean;
  };
  values?: MLAttributeValue[];
  allowed_units?: { id: string; name: string }[];
  default_unit?: string;
  hint?: string;
}

/** Detalhes de uma categoria, incluindo filhos (subcategorias) */
export interface MLCategoryDetails {
  id: string;
  name: string;
  path_from_root: { id: string; name: string }[];
  children_categories: { id: string; name: string; total_items_in_this_category: number }[];
}

export interface CreateAdDto {
  title: string;
  description?: string;
  price: number;
  availableQuantity: number;
  categoryId: string;
  condition: 'new' | 'used' | 'not_specified';
  listingTypeId: string;
  currencyId?: string;
  buyingMode?: string;
  warrantyType?: string;
  warrantyTime?: string;
  /** Atributos obrigatórios da categoria preenchidos pelo usuário */
  attributes?: { id: string; value_name: string }[];
  pictureUrls?: string[];
}

export interface UpdatePriceDto {
  price: number;
}

export interface UpdateStockDto {
  availableQuantity: number;
}

export interface CompetitorItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  seller_id: number;
}

export interface CompetitorAnalysis {
  adId: string;
  mlItemId: string;
  title: string;
  myPrice: number;
  competitors: CompetitorItem[];
  stats: {
    minPrice: number | null;
    maxPrice: number | null;
    avgPrice: number | null;
    count: number;
  };
}
