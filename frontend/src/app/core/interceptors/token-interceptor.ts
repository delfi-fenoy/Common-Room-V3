import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Interceptor -> Se va a ejecutar antes de cada petición para agregar el token (si es que hay)
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService); // Inyecto el AUthService
    const token = authService.getAccessToken(); // Obtenemos el token (si es que hay) guardado en el local storage

    if (token) {
        // Si hay token (el user está logueado)
        const cloned = req.clone({
            // Se clona la request original
            setHeaders: {
                Authorization: `Bearer ${token}`, // Se le agrega el token
            },
        });
        return next(cloned); // La request clonada (con el token en header) se pasa al back
    }
    return next(req); // Se pasa la request original al back (en caso que no haya user logueado)
};
