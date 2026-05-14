import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ad,
  AdsResponse,
  AdsFilter,
  CreateAdDto,
  UpdatePriceDto,
  UpdateStockDto,
  MLCategoryDetails,
  MLCategoryAttribute,
} from '../models/ad.model';

@Injectable({ providedIn: 'root' })
export class AdsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ads`;

  list(filter?: AdsFilter): Observable<AdsResponse> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<AdsResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Ad> {
    return this.http.get<Ad>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateAdDto): Observable<Ad> {
    return this.http.post<Ad>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<CreateAdDto>): Observable<Ad> {
    return this.http.put<Ad>(`${this.baseUrl}/${id}`, dto);
  }

  updatePrice(id: string, dto: UpdatePriceDto): Observable<Ad> {
    return this.http.patch<Ad>(`${this.baseUrl}/${id}/price`, dto);
  }

  updateStock(id: string, dto: UpdateStockDto): Observable<Ad> {
    return this.http.patch<Ad>(`${this.baseUrl}/${id}/stock`, dto);
  }

  pause(id: string): Observable<Ad> {
    return this.http.post<Ad>(`${this.baseUrl}/${id}/pause`, {});
  }

  activate(id: string): Observable<Ad> {
    return this.http.post<Ad>(`${this.baseUrl}/${id}/activate`, {});
  }

  sync(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/sync`, {});
  }

  getCategories(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.baseUrl}/categories`);
  }

  getCategoryDetails(categoryId: string): Observable<MLCategoryDetails> {
    return this.http.get<MLCategoryDetails>(`${this.baseUrl}/categories/${categoryId}`);
  }

  getCategoryAttributes(categoryId: string): Observable<MLCategoryAttribute[]> {
    return this.http.get<MLCategoryAttribute[]>(
      `${this.baseUrl}/categories/${categoryId}/attributes`,
    );
  }
}
