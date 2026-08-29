import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { PlaylistService } from '../../../core/services/playlist-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';

import { PlaylistDetails, MoviePreview } from '../../../core/models';
import { MovieCard } from '../../../shared/components/movie-card/movie-card';
import { EditPlaylistModal } from '../../../shared/components/edit-playlist-modal/edit-playlist-modal';
import { Modal } from '../../../shared/components/modal/modal';

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
    playlist: PlaylistDetails | null = null; // La playlist seleccionada
    movies: MoviePreview[] = []; // Películas asociadas a la playlist
    isLoadingPlaylist: boolean = true; // Indica si la playlist se está cargando

    // ? ----- Estado de Usuario y Permisos -----
    isLoggedIn: boolean = false;
    currentUsername: string | null = null;
    isOwner: boolean = false; // Indica si el usuario actual es el creador de la playlist

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // Carga la información del usuario y sus permisos desde el servicio de autenticación
        this.isLoggedIn = this.auth.isLoggedIn();
        this.currentUsername = this.auth.getUsername();

        // Escucha cambios en los parámetros de ruta (/playlists/:id) para recalcular cuando cambia de playlist
        this.route.params.subscribe((params) => {
            const playlistId = Number(params['id']);
            if (playlistId) {
                this.isLoadingPlaylist = true;
                this.playlist = null;
                this.movies = [];
                this.cdr.markForCheck();

                this.loadPlaylist(playlistId);
            }
        });
    }

    // ! -------- Método para cargar la Playlist desde el Backend --------
    loadPlaylist(id: number): void {
        // 1. Cargamos la información general de la playlist
        this.pService.getPlaylistById(id).subscribe({
            next: (data) => {
                this.playlist = data;

                // Verifica si el usuario actual es el dueño de la playlist
                if (this.currentUsername && data.userPreviewDTO) {
                    this.isOwner = data.userPreviewDTO.username === this.currentUsername;
                } else {
                    this.isOwner = false;
                }

                // Actualiza el título de la pestaña en el navegador con el nombre de la playlist
                if (data && data.name) {
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

        // 2. Cargamos las películas asociadas utilizando el endpoint dedicado del backend
        this.pService.getMovieListByPlaylistId(id).subscribe({
            next: (response) => {
                // Como el backend devuelve un Page<MoviePreview>, extraemos el contenido (.content)
                this.movies = response.content || [];
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar las películas de la playlist:', e);
                this.movies = [];
                this.cdr.markForCheck();
            },
        });
    }

    // ! -------- Gestión de Modales (Edición) --------
    openEditModal(): void {
        this.modalService.openCustom('Edit Playlist');
    }

    // ! -------- Confirmación y Eliminación de Playlist --------
    deletePlaylist(): void {
        if (!this.playlist) return;

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

    // ! -------- Eliminar Película de la Playlist --------
    removeMovie(movieId: number): void {
        if (!this.playlist) return;

        this.modalService.openConfirm(
            'Remove Movie',
            'Are you sure you want to remove this movie from the playlist?',
            () => this.executeRemoveMovie(this.playlist!.id, movieId),
        );
    }

    private executeRemoveMovie(playlistId: number, movieId: number): void {
        this.pService.deleteMovieFromPlaylist(playlistId, movieId).subscribe({
            next: () => {
                // Actualiza la lista localmente quitando la película borrada
                this.movies = this.movies.filter((m) => m.id !== movieId);

                this.modalService.openAlert(
                    'Success',
                    'Movie removed from the playlist.',
                    'success',
                );
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not remove the movie.', 'error');
            },
        });
    }
    // ? ----- Refrescar Datos de la Playlist tras Editar -----
    onPlaylistUpdated(): void {
        if (this.playlist) {
            this.loadPlaylist(this.playlist.id);
        }
    }

    // * -------- Métodos para reemplazar imágenes fallidas --------
    noPlaylistPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/playlist-noimg.jpg';
    }

    noUserPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/user-noimg.jpg';
    }
}
