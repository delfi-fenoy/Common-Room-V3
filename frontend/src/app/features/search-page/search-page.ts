import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MovieService } from '../../core/services/movie-service';
import { UserService } from '../../core/services/user-service';
import { PlaylistService } from '../../core/services/playlist-service';
import { MoviePreview, UserPreview, PlaylistPreview } from '../../core/models';

import { MovieCard } from '../../shared/cards/movie-card/movie-card';
import { PlaylistCard } from '../../shared/cards/playlist-card/playlist-card';

export type SearchTab = 'movies' | 'users' | 'playlists';

@Component({
    selector: 'app-search-page',
    standalone: true,
    imports: [RouterLink, MovieCard, PlaylistCard],
    templateUrl: './search-page.html',
    styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
    // * ======== Inyección de Servicios ========
    private route = inject(ActivatedRoute);
    private titleService = inject(Title);
    private mService = inject(MovieService);
    private uService = inject(UserService);
    private pService = inject(PlaylistService);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Variables de Estado ========
    query: string = '';
    activeTab: SearchTab = 'movies';

    // ? ----- Datos de Películas -----
    movies: MoviePreview[] = [];
    moviesPage: number = 1;
    hasMoreMovies: boolean = true;

    // ? ----- Datos de Usuarios -----
    users: UserPreview[] = [];
    usersPage: number = 1;
    hasMoreUsers: boolean = true;

    // ? ----- Datos de Playlists -----
    playlists: PlaylistPreview[] = [];
    playlistsPage: number = 1;
    hasMorePlaylists: boolean = true;

    // ? ----- Estado de Carga y Scroll -----
    isLoading: boolean = false;
    showScrollTopBtn: boolean = false;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // Escucha cambios en los parámetros de la URL (/search/:query)
        this.route.params.subscribe((params) => {
            this.query = params['query'] || '';

            // Actualiza el título de la pestaña en el navegador
            if (this.query) {
                this.titleService.setTitle(`${this.query} | Common Room`);
            } else {
                this.titleService.setTitle('Search | Common Room');
            }

            this.resetAndSearch();
        });
    }

    // <----- Cambio de Pestaña Activa ----->
    selectTab(tab: SearchTab): void {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.isLoading = false;

        if (tab === 'movies' && this.movies.length === 0 && this.hasMoreMovies) {
            this.searchMovies();
        } else if (tab === 'users' && this.users.length === 0 && this.hasMoreUsers) {
            this.searchUsers();
        } else if (tab === 'playlists' && this.playlists.length === 0 && this.hasMorePlaylists) {
            this.searchPlaylists();
        }
    }

    // <----- Resetear Búsqueda General ----->
    private resetAndSearch(): void {
        this.movies = [];
        this.users = [];
        this.playlists = [];
        this.moviesPage = 1;
        this.usersPage = 1;
        this.playlistsPage = 1;
        this.hasMoreMovies = true;
        this.hasMoreUsers = true;
        this.hasMorePlaylists = true;

        if (this.activeTab === 'movies') {
            this.searchMovies();
        } else if (this.activeTab === 'users') {
            this.searchUsers();
        } else if (this.activeTab === 'playlists') {
            this.searchPlaylists();
        }
    }

    // <----- Búsqueda de Películas ----->
    searchMovies(): void {
        if (this.isLoading || !this.hasMoreMovies || !this.query.trim()) return;
        this.isLoading = true;

        this.mService.searchOrDiscoverMovies(this.moviesPage, this.query).subscribe({
            next: (data) => {
                const newMovies = data.filter(
                    (newMovie) => !this.movies.some((existing) => existing.id === newMovie.id),
                );
                this.movies = [...this.movies, ...newMovies];
                this.hasMoreMovies = data.length === 20;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error al buscar películas:', e);
                this.isLoading = false;
                this.hasMoreMovies = false;
                this.cdr.detectChanges();
            },
        });
    }

    // <----- Búsqueda de Usuarios ----->
    searchUsers(): void {
        if (this.isLoading || !this.hasMoreUsers || !this.query.trim()) return;
        this.isLoading = true;

        this.uService.searchUsers(this.query, undefined, this.usersPage).subscribe({
            next: (pageResponse) => {
                const newUsers = pageResponse.content.filter(
                    (newUser) => !this.users.some((existing) => existing.id === newUser.id),
                );
                this.users = [...this.users, ...newUsers];
                this.hasMoreUsers = !pageResponse.last;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error al buscar usuarios:', e);
                this.isLoading = false;
                this.hasMoreUsers = false;
                this.cdr.detectChanges();
            },
        });
    }

    // <----- Búsqueda de Playlists ----->
    searchPlaylists(): void {
        if (this.isLoading || !this.hasMorePlaylists || !this.query.trim()) return;
        this.isLoading = true;

        this.pService.searchPlaylists(this.query, this.playlistsPage).subscribe({
            next: (pageResponse) => {
                const newPlaylists = pageResponse.content.filter(
                    (newPlaylist) =>
                        !this.playlists.some((existing) => existing.id === newPlaylist.id),
                );
                this.playlists = [...this.playlists, ...newPlaylists];
                this.hasMorePlaylists = !pageResponse.last;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error al buscar playlists:', e);
                this.isLoading = false;
                this.hasMorePlaylists = false;
                this.cdr.detectChanges();
            },
        });
    }

    // <----- Listener de Scroll Infinito ----->
    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        this.showScrollTopBtn = window.scrollY > 400;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 600;

        if (scrollPosition >= threshold && !this.isLoading) {
            if (this.activeTab === 'movies' && this.hasMoreMovies && this.movies.length > 0) {
                this.moviesPage++;
                this.searchMovies();
            } else if (this.activeTab === 'users' && this.hasMoreUsers && this.users.length > 0) {
                this.usersPage++;
                this.searchUsers();
            } else if (
                this.activeTab === 'playlists' &&
                this.hasMorePlaylists &&
                this.playlists.length > 0
            ) {
                this.playlistsPage++;
                this.searchPlaylists();
            }
        }
    }

    // <----- Desplazar suavemente arriba ----->
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // <----- Reemplazo de Imagen de Perfil Fallida ----->
    noProfilePicture(event: Event, role?: string): void {
        const img = event.target as HTMLImageElement;
        img.src =
            role === 'ADMIN'
                ? 'assets/img/default-img/admin-noimg.jpg'
                : 'assets/img/default-img/user-noimg.jpg';
    }
}