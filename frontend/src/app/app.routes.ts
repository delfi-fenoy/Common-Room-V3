import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page';
import { MovieSheet } from './pages/movie-sheet/movie-sheet';
import { UserProfile } from './pages/user-profile/user-profile';
import { UsersList } from './pages/users-list/users-list';
import { MoviesList } from './pages/movies-list/movies-list';
import { SearchPage } from './pages/search-page/search-page';
import { guestGuard } from './guards/guest-guard';
import { RegisterPage } from './pages/register-page/register-page';
import { authGuard } from './guards/auth-guard';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
    {path: '', component: HomePage, title:"Home | Common Room"},
    {path: 'login', component: LoginPage, title:"Login | Common Room", canActivate: [guestGuard]},
    {path: 'register', component: RegisterPage, title:"Register | Common Room", canActivate: [guestGuard]},
    {path: 'movies', component: MoviesList, title:"Movies | Common Room"},
    {path: 'movies/:id', component: MovieSheet},
    {path: 'movies/search/:query', component: SearchPage},
    {path: 'users', component: UsersList, title:"Users | Common Room"},
    {path: 'users/:username', component: UserProfile},
    {path: 'users/me', component: UserProfile},
    {path: '404', component: NotFound},
  
    //Cualquier otra ruta redirige a home
    {path: '', redirectTo: '/', pathMatch: 'full'},

    //Ruta not found
    {path: '**', redirectTo: '/404'}
];

