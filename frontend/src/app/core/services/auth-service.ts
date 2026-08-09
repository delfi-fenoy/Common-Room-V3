import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';
import { RegisterRequest, TokenResponse, LoginRequest } from '../models';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    /* ! ======== API para acceder al AuthController ======== */
    private readonly API_URL = 'http://localhost:8080/auth';

    // * ---- Observables de Estado de Sesión ----
    private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn()); // Guarda el estado actual (logueado o no)
    loggedIn$ = this.loggedInSubject.asObservable(); // Observable que otros componentes (como el header) pueden escuchar

    private usernameInSubject = new BehaviorSubject<string | null>(this.getUsername());
    username$ = this.usernameInSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    /* ------ Metodo para verificar estado de autenticación local ------ */
    isLoggedIn(): boolean {
        return !!localStorage.getItem('access_token');
    }

    /* ------ Metodo para obtener el rol del usuario autenticado ------ */
    getUserRole(): string | null {
        return localStorage.getItem('role');
    }

    /* ------ Metodo para obtener el username del usuario autenticado ------ */
    getUsername(): string | null {
        return localStorage.getItem('username');
    }

    /* ------ Metodo para obtener el Token de acceso JWT ------ */
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    /* ------ Metodo para iniciar sesión de usuario ------ */
    login(user: LoginRequest): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/login`, user).pipe(
            tap((res) => {
                this.saveTokens(res);
                this.loggedInSubject.next(true);
            }),
        );
    }

    /* ------ Metodo para registrar un nuevo usuario ------ */
    register(user: RegisterRequest): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/register`, user).pipe(
            tap((res) => {
                this.saveTokens(res);
                this.loggedInSubject.next(true);
            }),
        );
    }

    /* ------ Metodo para cerrar la sesión activa ------ */
    logout(): void {
        this.http
            .post<void>('http://localhost:8080/logout', {})
            .pipe(
                // 'finalize' se ejecutará después de 'next' O 'error'
                finalize(() => {
                    // Esta es la lógica de limpieza que SIEMPRE debe ejecutarse
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    this.loggedInSubject.next(false);
                    this.usernameInSubject.next(null); // Emite null para limpiar la sesión en componentes
                    this.router.navigate(['/']);
                }),
            )
            .subscribe({
                next: () => {
                    console.log('Server logout successful');
                },
                error: (e) => {
                    console.warn(
                        'Server logout failed (user likely deleted), forcing local logout.',
                        e,
                    );
                },
            });
    }

    /* ------ Metodo para guardar Tokens de sesión en localStorage ------ */
    saveTokens(response: TokenResponse): void {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        this.usernameInSubject.next(response.username);
    }

    /* ------ Metodo para actualizar la sesión tras renombrar usuario ------ */
    updateSession(response: TokenResponse): void {
        this.saveTokens(response);
        this.usernameInSubject.next(response.username);
    }

    /* ------ Metodo para actualizar solo el username en la sesión local ------ */
    updateUsername(newUsername: string): void {
        localStorage.setItem('username', newUsername);
        this.usernameInSubject.next(newUsername);
    }
}