import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';
import TokenResponse from '../models/TokenResponse';
import { RegisterRequest } from '../models/RegisterRequest';
import { Token } from '@angular/compiler';
import { LoginRequest } from '../models/LoginRequest';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:8080/auth';
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn()); // guarda el estado actual (logueado o no)
  loggedIn$ = this.loggedInSubject.asObservable(); // observable que otros componentes (como el header) pueden escuchar

  private usernameInSubject = new BehaviorSubject<string|null>(this.getUsername());
  username$ = this.usernameInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(user: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, user).pipe(
      tap((res) => {
        this.saveTokens(res);
        this.loggedInSubject.next(true); // avisa a quienes estan suscriptos los cambios de logueo del usuario
      })
    );
  }

  register(user: RegisterRequest): Observable<TokenResponse> {
    console.log(user);
    return this.http.post<TokenResponse>(`${this.API_URL}/register`, user).pipe(
      tap((res) => {
        this.saveTokens(res);
        this.loggedInSubject.next(true);
      })
    );
  }

  logout() {
    this.http.post<void>('http://localhost:8080/logout', {}).pipe(
      // 'finalize' se ejecutará después de 'next' O 'error'
      finalize(() => {
        // Esta es la lógica de limpieza que SIEMPRE debe ejecutarse
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        this.loggedInSubject.next(false);
        this.router.navigate(['/']);
      })
    ).subscribe({
      next: () => {
        // Bien, el servidor lo procesó
        console.log('Server logout successful');
      },
      error: (e) => {
        // No pasa nada, 'finalize' limpiará todo.
        console.warn('Server logout failed (user likely deleted), forcing local logout.', e);
      }
    });
  }

  saveTokens(response: TokenResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('role', response.role);

    this.usernameInSubject.next(response.username);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
