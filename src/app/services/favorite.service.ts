import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Favorite, FavoriteList } from '../shared/models/favorite';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly apiUrl = '/api/v1/favorites';

  constructor(private http: HttpClient) {}

  getMyFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/my-list`);
  }

  addAnnouncementFavorite(announcementId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/announcements/${announcementId}`, {});
  }

  removeAnnouncementFavorite(announcementId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/announcements/${announcementId}`);
  }

  addMerchantFavorite(merchantId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/merchants/${merchantId}`, {});
  }

  removeMerchantFavorite(merchantId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/merchants/${merchantId}`);
  }
}
