import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface UserInfo {
  id: number;
  username: string;
  roles: string[];
  allowedModules: string[];
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_INFO_KEY = 'user_info';
  private baseUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    if (userInfo) {
      try {
        this.currentUserSubject.next(JSON.parse(userInfo));
      } catch {
        this.logout();
      }
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        this.setToken(response.accessToken);
      })
    );
  }

  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate <= new Date();
    } catch {
      return true;
    }
  }

  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  getUserRoles(): string[] {
    const user = this.currentUserSubject.value;
    return user?.roles || [];
  }

  getAllowedModules(): string[] {
    const user = this.currentUserSubject.value;
    return user?.allowedModules || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  hasModule(module: string): boolean {
    const modules = this.getAllowedModules().map(m => m.toUpperCase());
    return modules.includes(module.toUpperCase());
  }

  mustChangePassword(): boolean {
    const user = this.currentUserSubject.value;
    return user?.mustChangePassword || false;
  }
}
