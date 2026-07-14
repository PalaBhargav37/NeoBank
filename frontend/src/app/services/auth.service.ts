import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { ApiResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API = 'http://localhost:8080/api/auth';

  currentUser = signal<AuthResponse | null>(this.getStoredUser());

  private getStoredUser(): AuthResponse | null {
    try {
      const u = localStorage.getItem('neobank_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/login`, req).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('neobank_token', res.data.token);
          localStorage.setItem('neobank_user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/register`, req).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('neobank_token', res.data.token);
          localStorage.setItem('neobank_user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('neobank_token');
    localStorage.removeItem('neobank_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('neobank_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }
}
