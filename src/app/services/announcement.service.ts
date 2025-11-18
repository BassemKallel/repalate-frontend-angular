import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Announcement } from '../shared/models/announcement';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly apiUrl = '/api/v1'

  constructor(private http: HttpClient) {}

  getAll(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/offers/browse`);
  }

  getById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/offers/${id}`);
  }

  getMyOffers(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/offers/my-offers`);
  }

  create(payload: Partial<Announcement>): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/offers/create`, payload);
  }

  update(id: number, payload: Partial<Announcement>): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/offers/update/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/offers/delete/${id}`);
  }
}
