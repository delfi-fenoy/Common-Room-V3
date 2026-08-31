import { Routes } from '@angular/router';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

/* 
    * <----- Lazy Loading vs Direct Import ----->
    * Se utiliza `loadComponent` (Lazy Loading) en lugar de importaciones directas al inicio del archivo
    * para optimizar la carga inicial (First Contentful Paint).
    *
    * - Antes: Todos los componentes se incluían en el bundle principal, forzando al navegador
    *   a descargar el código de toda la aplicación aunque el usuario solo visitara la Home.
    * 
    * - Ahora: Cada ruta descarga su módulo/componente bajo demanda únicamente cuando el usuario navega a ella,
    *   reduciendo drásticamente el peso inicial de la app.
*/

/* ! ======== Configuración Global de Rutas ======== */
export const routes: Routes = [
    /* ------ Pagina Principal ------ */
    { 
        path: '', 
        loadComponent: () => import('./features/home-page/home-page').then(m => m.HomePage), 
        title: 'Home | Common Room' 
    },

    /* ------ Autenticación y Registro ------ */
    { 
        path: 'login', 
        loadComponent: () => import('./features/auth/login-page/login-page').then(m => m.LoginPage), 
        title: 'Login | Common Room', 
        canActivate: [guestGuard] 
    },
    { 
        path: 'register', 
        loadComponent: () => import('./features/auth/register-page/register-page').then(m => m.RegisterPage), 
        title: 'Register | Common Room', 
        canActivate: [guestGuard] 
    },
    { 
        path: 'search/:query', 
        loadComponent: () => import('./features/search-page/search-page').then(m => m.SearchPage) 
    },
    
    /* ------ Modulo de Películas ------ */
    { 
        path: 'movies', 
        loadComponent: () => import('./features/movies/movies-list/movies-list').then(m => m.MoviesList), 
        title: 'Movies | Common Room' 
    },
    { 
        path: 'movies/:id', 
        loadComponent: () => import('./features/movies/movie-sheet/movie-sheet').then(m => m.MovieSheet) 
    },

    /* ------ Modulo de Usuarios ------ */
    { 
        path: 'users', 
        loadComponent: () => import('./features/users/users-list/users-list').then(m => m.UsersList), 
        title: 'Users | Common Room' 
    },
    { 
        path: 'users/me', 
        loadComponent: () => import('./features/users/user-profile/user-profile').then(m => m.UserProfile), 
        canActivate: [authGuard] 
    },
    { 
        path: 'users/:username', 
        loadComponent: () => import('./features/users/user-profile/user-profile').then(m => m.UserProfile) 
    },

    /* ------ Modulo de playlist ------ */
    { 
        path: 'playlists', 
        loadComponent: () => import('./features/playlists/playlists-list/playlists-list').then(m => m.PlaylistsList), 
        title: 'Playlists | Common Room' 
    },
    { 
        path: 'playlists/:id', 
        loadComponent: () => import('./features/playlists/playlist-sheet/playlist-sheet').then(m => m.PlaylistSheet) 
    },

    /* ------ Modulo Errores y Redirecciones ------ */
    { 
        path: '404', 
        loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound), 
        title: '404 | Not Found' 
    },
    { path: '**', redirectTo: '/404' },
];