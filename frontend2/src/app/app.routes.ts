import { Routes } from '@angular/router';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

// Componentes
import { HomePage } from './features/home-page/home-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { RegisterPage } from './features/auth/register-page/register-page';
import { MoviesList } from './features/movies/movies-list/movies-list';
import { MovieSheet } from './features/movies/movie-sheet/movie-sheet';
import { SearchPage } from './features/search/search-page/search-page';
import { UsersList } from './features/users/users-list/users-list';
import { UserProfile } from './features/users/user-profile/user-profile';
import { NotFound } from './features/not-found/not-found';

/* ! ======== Configuración Global de Rutas ======== */
export const routes: Routes = [
    /* ------ Pagina Principal ------ */
    { path: '', component: HomePage, title: 'Home | Common Room' },

    /* ------ Autenticación y Registro ------ */
    { path: 'login', component: LoginPage, title: 'Login | Common Room', canActivate: [guestGuard] },
    { path: 'register', component: RegisterPage, title: 'Register | Common Room', canActivate: [guestGuard] },

    /* ------ Modulo de Películas ------ */
    { path: 'movies', component: MoviesList, title: 'Movies | Common Room' },
    { path: 'movies/search/:query', component: SearchPage },
    { path: 'movies/:id', component: MovieSheet },

    /* ------ Modulo de Usuarios ------ */
    { path: 'users', component: UsersList, title: 'Users | Common Room' },
    { path: 'users/me', component: UserProfile, canActivate: [authGuard] },
    { path: 'users/:username', component: UserProfile },

    /* ------ Modulo Errores y Redirecciones ------ */
    { path: '404', component: NotFound, title: '404 | Not Found' },
    { path: '**', redirectTo: '/404' }
];