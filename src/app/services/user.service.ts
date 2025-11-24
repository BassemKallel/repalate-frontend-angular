import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/v1/users';
  private readonly adminUrl = '/api/v1/admin';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminUrl}/users`);
  }

  getPendingAccounts(): Observable<User[]> {
    return this.http.get<User[]>(`/api/v1/admin/pending`);
  }

  validateUser(id: number): Observable<string> {
    return this.http.post(`/api/v1/admin/validate/${id}`, {}, { responseType: 'text' });
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete(`/api/v1/admin/delete/${id}`, { responseType: 'text' });
  }
}
