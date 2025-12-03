import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Favorite, FavoriteList } from '../shared/models/favorite';
import { Announcement } from '../shared/models/announcement';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly apiUrl = '/api/v1/favorites';

  constructor(private http: HttpClient) { }

  getMyFavorites(): Observable<FavoriteList> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/my-list`).pipe(
      switchMap(favorites => {
        const announcementIds = favorites
          .filter(f => f.targetType === 'ANNOUNCEMENT')
          .map(f => f.targetId);

        const merchantIds = favorites
          .filter(f => f.targetType === 'MERCHANT')
          .map(f => f.targetId);

        const announcements$ = announcementIds.length > 0
          ? forkJoin(announcementIds.map(id =>
            this.http.get<Announcement>(`/api/v1/offers/${id}`).pipe(
              catchError(() => of(null))
            )
          )).pipe(
            map(results => results.filter(a => a !== null) as Announcement[])
          )
          : of([]);

        const merchants$ = merchantIds.length > 0
          ? forkJoin(merchantIds.map(id =>
            this.http.get<User>(`/api/v1/users/${id}`).pipe(
              catchError(() => of(null))
            )
          )).pipe(
            map(results => results.filter(m => m !== null) as User[])
          )
          : of([]);

        return forkJoin({
          announcements: announcements$,
          merchants: merchants$
        });
      }),
      catchError(() => of({ announcements: [], merchants: [] }))
    );
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

  // Check if an announcement is favorited
  isAnnouncementFavorited(announcementId: number): Observable<boolean> {
    return this.getMyFavorites().pipe(
      map(favorites => favorites.announcements?.some(a => a.id === announcementId) || false),
      catchError(() => of(false))
    );
  }

  // Check if a merchant is favorited
  isMerchantFavorited(merchantId: number): Observable<boolean> {
    return this.getMyFavorites().pipe(
      map(favorites => favorites.merchants?.some(m => m.id === merchantId) || false),
      catchError(() => of(false))
    );
  }
}
