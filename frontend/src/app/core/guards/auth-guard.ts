import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService); // Inyectamos AuthService para saber si el user está logueado
    const router = inject(Router); // Para redirigir
    return auth.isLoggedIn() ? true : router.parseUrl('/login'); // Si el user esta logueado, devuelve true, sino redirige al login
};
