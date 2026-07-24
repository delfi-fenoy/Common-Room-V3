import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Interceptor -> Se va a ejecutar antes de cada petición para agregar el token (si es que hay)
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService) // inyecto el AUthService
  const token = authService.getAccessToken() // obtenemos el token (si es que hay) guardado en el local storage

  if(token){ // si hay token (el user está logueado)
    const cloned = req.clone({ // se clona la request original
      setHeaders: {
        Authorization: `Bearer ${token}` // se le agrega el token
      }
    })
    return next(cloned) // la request clonada (con el token en header) se pasa al back
  }
  return next(req) // se pasa la request original al back (en caso que no haya user logueado)
};
