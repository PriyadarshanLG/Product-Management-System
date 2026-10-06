import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/product.model';

export interface AdminSession {
  token: string;
  username: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly loginUrl = `${environment.apiBaseUrl}/auth/login`;
  private readonly tokenKey = 'gupio.admin.token';
  private readonly expiresKey = 'gupio.admin.expiresAt';
  private readonly usernameKey = 'gupio.admin.username';

  constructor(private http: HttpClient) {}

  get token(): string | null {
    const token = sessionStorage.getItem(this.tokenKey);
    const expiresAt = Number(sessionStorage.getItem(this.expiresKey));
    if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      this.signOut();
      return null;
    }
    return token;
  }

  get username(): string {
    return sessionStorage.getItem(this.usernameKey) || 'Admin';
  }

  isSignedIn(): boolean {
    return this.token !== null;
  }

  signIn(username: string, password: string): Observable<AdminSession> {
    return this.http.post<ApiResponse<AdminSession>>(this.loginUrl, { username, password }).pipe(
      map((response) => response.data),
      tap((session) => {
        sessionStorage.setItem(this.tokenKey, session.token);
        sessionStorage.setItem(this.expiresKey, String(Date.now() + session.expiresIn * 1000));
        sessionStorage.setItem(this.usernameKey, session.username);
      })
    );
  }

  signOut(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.expiresKey);
    sessionStorage.removeItem(this.usernameKey);
  }
}