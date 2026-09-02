import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { PlaylistDetails, MoviePreview } from '../../../core/models';
import { PlaylistService } from '../../../core/services/playlist-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';

import { MovieCard } from '../../../shared/cards/movie-card/movie-card';
import { EditPlaylistModal } from '../../../shared/modals/edit-playlist-modal/edit-playlist-modal';
import { Modal } from '../../../shared/modals/modal/modal';

@Component({
    selector: 'app-playlist-sheet',
    standalone: true,
    imports: [CommonModule, RouterLink, MovieCard, EditPlaylistModal, Modal],
    templateUrl: './playlist-sheet.html',
    styleUrl: './playlist-sheet.css',
})
export class PlaylistSheet implements OnInit {
    // * ======== Inyección de Servicios ========
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private pService = inject(PlaylistService);
    private auth = inject(AuthService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);
    private titleService = inject(Title);

    // * ======== Variables de Estado ========
    playlist: PlaylistDetails | null = null;
    movies: MoviePreview[] = [];
    isLoadingPlaylist: boolean = true;

    // ? ----- Paginación de Películas -----
    currentPage: number = 1;
    totalPages: number = 1;
    totalElements: number = 0;

    // ? ----- Permisos y Sesión -----
    isLoggedIn: boolean = false;
    currentUsername: string | null = null;
    isOwner: boolean = false;
    isAdmin: boolean = false;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // Carga la información del usuario y sus permisos desde el servicio de autenticación
        this.isLoggedIn = this.auth.isLoggedIn();
        this.currentUsername = this.auth.getUsername();
        this.isAdmin = this.auth.getUserRole() === 'ADMIN';

        // Escucha cambios en los parámetros de ruta (/playlists/:id) para recalcular cuando cambia de playlist
        this.route.params.subscribe((params) => {
            const playlistId = Number(params['id']);
            if (playlistId) {
                this.isLoadingPlaylist = true;
                this.playlist = null;
                this.movies = [];
                this.currentPage = 1;
                this.cdr.markForCheck();

                this.loadPlaylist(playlistId, 1);
            }
        });
    }

    // <----- Cargar Datos e Ítems de la Playlist ----->
    loadPlaylist(id: number, page: number = 1): void {
        // 1. Cargamos la información general de la playlist si no la tenemos aún
        if (!this.playlist) {
            this.pService.getPlaylistById(id).subscribe({
                next: (data) => {
                    this.playlist = data;
                    this.isOwner = !!(
                        this.currentUsername &&
                        data?.userPreviewDTO?.username === this.currentUsername
                    );

                    if (data?.name) {
                        this.titleService.setTitle(`${data.name} | Common Room`);
                    }

                    this.isLoadingPlaylist = false;
                    this.cdr.markForCheck();
                },
                error: (e) => {
                    console.error('Error al cargar la playlist:', e);
                    this.playlist = null;
                    this.movies = [];
                    this.titleService.setTitle('Playlist Details | Common Room');
                    this.isLoadingPlaylist = false;
                    this.cdr.markForCheck();
                },
            });
        }

        // 2. Cargamos las películas asociadas utilizando la página requerida
        this.pService.getMovieListByPlaylistId(id, page).subscribe({
            next: (response) => {
                // Como el backend devuelve un Page<MoviePreview>, extraemos el contenido y metadata
                this.movies = response.content || [];
                this.currentPage = page;
                this.totalPages = response.totalPages || 1;
                this.totalElements = response.totalElements || 0;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar las películas de la playlist:', e);
                this.movies = [];
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Paginación ----->
    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage && this.playlist) {
            this.loadPlaylist(this.playlist.id, page);
        }
    }

    // <----- Apertura de Modales ----->
    openEditModal(): void {
        this.modalService.openCustom('Edit Playlist');
    }

    // <----- Eliminación de Playlist ----->
    deletePlaylist(): void {
        // Valida que exista la playlist y que el usuario actual sea el dueño
        if (!this.playlist || !this.isOwner) return;

        this.modalService.openConfirm(
            'Delete Playlist',
            'Are you sure you want to delete this playlist? This action cannot be undone.',
            () => this.executeDeletePlaylist(this.playlist!.id),
        );
    }

    private executeDeletePlaylist(playlistId: number): void {
        this.pService.deletePlaylist(playlistId).subscribe({
            next: () => {
                this.modalService.openAlert(
                    'Deleted',
                    'The playlist was successfully deleted.',
                    'success',
                );
                this.router.navigate(['/']);
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not delete the playlist.', 'error');
            },
        });
    }

    // <----- Remoción de Películas de la Playlist ----->
    removeMovie(movieId: number): void {
        // Valida que exista la playlist y que el usuario actual sea el dueño
        if (!this.playlist || !this.isOwner) return;

        this.modalService.openConfirm(
            'Remove Movie',
            'Are you sure you want to remove this movie from the playlist?',
            () => this.executeRemoveMovie(this.playlist!.id, movieId),
        );
    }

    // <----- Actualización manual del contador al eliminar una película ----->
    private executeRemoveMovie(playlistId: number, movieId: number): void {
        this.pService.deleteMovieFromPlaylist(playlistId, movieId).subscribe({
            next: () => {
                this.modalService.openAlert(
                    'Success',
                    'Movie removed from the playlist.',
                    'success',
                );

                // Actualizamos la cantidad total localmente
                if (this.totalElements > 0) {
                    this.totalElements--;
                }

                const targetPage =
                    this.movies.length === 1 && this.currentPage > 1
                        ? this.currentPage - 1
                        : this.currentPage;

                this.loadPlaylist(this.playlist!.id, targetPage);
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not remove the movie.', 'error');
            },
        });
    }

    // <----- Evento de Actualización tras Edición ----->
    onPlaylistUpdated(): void {
        if (this.playlist) {
            const playlistId = this.playlist.id;
            this.playlist = null;
            this.loadPlaylist(playlistId, 1);
        }
    }

    // <----- Helpers de Imágenes Fallidas ----->
    noPlaylistPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/playlist-noimg.jpg';
    }

    noUserPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/user-noimg.jpg';
    }
}