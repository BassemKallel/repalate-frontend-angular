import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../shared/models/user';
import { MessageResponse } from '../shared/models/auth';

interface JwtPayload {
  sub: string;
  role?: UserRole;
  fullName?: string;
  email?: string;
  exp?: number;
  userId?: number;
  id?: number;
}

interface AuthResponse {
  userId: number;
  username: string;
  role: string;
  jwtToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/v1/users';
  private readonly tokenKey = 'replate_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response?.jwtToken) {
            localStorage.setItem(this.tokenKey, response.jwtToken);
            // Créer l'objet User à partir de la réponse
            const user: User = {
              id: response.userId,
              fullName: response.username,
              email: response.username,
              phoneNumber: '',
              location: '',
              role: response.role as UserRole
            };
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(payload: any): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/register`, payload);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateUserProfile(payload: { username: string; phoneNumber: string; location: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, payload);
  }

  changePassword(payload: { oldPassword: string; newPassword: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/me/password`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) {
      return true;
    }
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      this.logout();
      return false;
    }
    return true;
  }

  hasRole(roles: UserRole[] | string[]): boolean {
    const currentRole = this.currentUserSubject.value?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  getRole(): UserRole | undefined {
    return this.currentUserSubject.value?.role;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (token) {
      this.setCurrentUser(token);
    }
  }

  private setCurrentUser(token: string, fallbackUser?: User): void {
    const decoded = this.decodeToken(token);
    console.log('Raw Token:', token);
    console.log('Decoded JWT:', decoded);
    if (!decoded) {
      this.currentUserSubject.next(fallbackUser ?? null);
      return;
    }
    const user: User = fallbackUser ?? {
      id: decoded.userId ?? (Number.isNaN(Number(decoded.sub)) ? 0 : Number(decoded.sub)),
      fullName: decoded.fullName ?? 'Replate User',
      email: decoded.email ?? decoded.sub ?? '',
      phoneNumber: '',
      location: '',
      role: decoded.role ?? 'INDIVIDUAL'
    };
    console.log('Created user object:', user);
    if (!user.role && decoded.role) {
      user.role = decoded.role;
    }
    this.currentUserSubject.next(user);
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Unable to decode JWT', error);
      return null;
    }
  }
}
