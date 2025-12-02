import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest, AuthResponse, RegisterRequest, MessageResponse, ProfileUpdateRequest } from '../shared/models/auth';
import { User, UserRole } from '../shared/models/user';

interface JwtPayload {
  sub: string;
  role?: UserRole;
  username?: string;
  email?: string;
  exp?: number;
  userId?: number;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/v1/users';
  private readonly tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/register`, request);
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.jwtToken) {
          localStorage.setItem(this.tokenKey, response.jwtToken);
          this.setCurrentUser(response.jwtToken);
        }
      })
    );
  }

  updateProfile(request: ProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me/profile`, request);
  }

  // Alias for compatibility
  updateUserProfile(request: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  changePassword(payload: { oldPassword: string; newPassword: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/me/password`, payload);
  }

  hasRole(roles: UserRole[] | string[]): boolean {
    const currentRole = this.currentUserSubject.value?.role;
    return currentRole ? roles.includes(currentRole) : false;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
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

  getRole(): UserRole | undefined {
    return this.currentUserSubject.value?.role;
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (token) {
      this.setCurrentUser(token);
    }
  }

  private setCurrentUser(token: string): void {
    const decoded = this.decodeToken(token);
    console.log('Restoring session from token:', decoded);

    if (!decoded) {
      this.currentUserSubject.next(null);
      return;
    }

    const user: User = {
      id: decoded.userId ?? (Number.isNaN(Number(decoded.sub)) ? 0 : Number(decoded.sub)),
      username: decoded.username ?? decoded.sub ?? 'User',
      email: decoded.email ?? decoded.sub ?? '',
      phoneNumber: '',
      location: '',
      role: decoded.role ?? 'INDIVIDUAL'
    };

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
