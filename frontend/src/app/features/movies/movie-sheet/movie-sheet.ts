import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MovieService } from '../../../core/services/movie-service';
import { ReviewService } from '../../../core/services/review-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';

import { MovieDetails, Review } from '../../../core/models';
import { ReviewCard } from '../../../shared/cards/review-card/review-card';
import { ReviewFormModal } from '../../../shared/modals/review-form-modal/review-form-modal';
import { PlaylistModal } from '../../../shared/modals/playlist-modal/playlist-modal';
import { TMDB_GENRES } from '../movies-list/movies-list';

@Component({
    selector: 'app-movie-sheet',
    standalone: true,
    imports: [CommonModule, RouterLink, ReviewCard, ReviewFormModal, PlaylistModal],
    templateUrl: './movie-sheet.html',
    styleUrl: './movie-sheet.css',
})
export class MovieSheet implements OnInit {
    // * ======== Inyección de Servicios ========
    private route = inject(ActivatedRoute);
    private mService = inject(MovieService);
    private rService = inject(ReviewService);
    private auth = inject(AuthService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);
    private titleService = inject(Title); // <----- Inyección del servicio de título

    // * ======== Variables de Estado ========
    chosenMovie: MovieDetails | null = null; // La película seleccionada
    reviews: Review[] = []; // Reviews asociadas a la película
    isLoadingMovie: boolean = true; // Indica si la película se está cargando

    // ? ----- Paginación de Reseñas -----
    currentPage: number = 1;
    totalPages: number = 1;
    isLoadingReviews: boolean = false;

    // ? ----- Selección y Estado de Usuario -----
    selectedReview: Review | null = null;
    isLoggedIn: boolean = false;
    isAdmin: boolean = false;
    currentUsername: string | null = null;
    currentUserReview: Review | null = null;

    // ? ----- Contexto del Modal -----
    currentModalContext: 'review' | 'playlist' | null = null;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // Carga la información del usuario y sus permisos desde el servicio de autenticación
        this.isLoggedIn = this.auth.isLoggedIn();
        this.currentUsername = this.auth.getUsername();
        this.isAdmin = this.auth.getUserRole() === 'ADMIN';

        // Escucha cambios en los parámetros de ruta (/movies/:id) para recalcular cuando cambia de película
        this.route.params.subscribe((params) => {
            const movieId = Number(params['id']);
            if (movieId) {
                this.isLoadingMovie = true;
                this.chosenMovie = null;
                this.currentUserReview = null;
                this.reviews = [];
                this.cdr.markForCheck();

                this.loadMovie(movieId);

                if (this.currentUsername) {
                    this.getCurrentUserReview(this.currentUsername, movieId);
                }

                this.loadReviews(movieId, 1);
            }
        });
    }

    // ? ----- Genre Navigation Helper ----->
    getGenreIdByName(genre: any): number | null {
        if (!genre) return null;
        if (typeof genre === 'object' && genre.id) return genre.id;
        const genreName = String(genre).trim();
        const found = TMDB_GENRES.find((g) => g.name.toLowerCase() === genreName.toLowerCase());
        return found ? found.id : null;
    }

    // ! -------- Método para cargar la Película desde el Backend --------
    loadMovie(id: number): void {
        this.mService.getMovieById(id).subscribe({
            next: (data) => {
                this.chosenMovie = data;

                // Actualiza el título de la pestaña en el navegador con el nombre de la película
                if (data && data.title) {
                    this.titleService.setTitle(`${data.title} | Common Room`);
                }

                this.isLoadingMovie = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar la película:', e);
                this.chosenMovie = null;
                this.titleService.setTitle('Movie Details | Common Room');
                this.isLoadingMovie = false;
                this.cdr.markForCheck();
            },
        });
    }

    // ! -------- Método para cargar Reseñas --------
    loadReviews(movieId: number, page: number): void {
        this.isLoadingReviews = true;
        this.currentPage = page;

        this.rService.getReviewsForMovie(movieId, page).subscribe({
            next: (pageData) => {
                this.reviews = pageData.content.filter(
                    (review) =>
                        !this.currentUsername ||
                        review.userPreview?.username !== this.currentUsername,
                );
                this.totalPages = pageData.totalPages || 1;

                this.isLoadingReviews = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar reseñas:', e);
                this.isLoadingReviews = false;
                this.cdr.markForCheck();
            },
        });
    }

    // ? ----- Cambio de Página -----
    changePage(newPage: number): void {
        if (this.chosenMovie && newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.loadReviews(this.chosenMovie.id, this.currentPage);
        }
    }

    // ! -------- Obtener Reseña Propia del Usuario --------
    // Carga la reseña propia que haya hecho el usuario autenticado en esta película específica
    getCurrentUserReview(username: string, movieId: number): void {
        this.rService.getUserReviewForMovie(username, movieId).subscribe({
            next: (data) => {
                this.currentUserReview = data;
                this.cdr.markForCheck();
            },
            error: () => {
                this.currentUserReview = null;
                this.cdr.markForCheck();
            },
        });
    }

    // ! -------- Gestión de Modales --------
    // Abrir Modal de Crear Reseña
    openCreateModal(): void {
        this.selectedReview = null;
        this.currentModalContext = 'review';
        this.modalService.openCustom('Add Review');
    }

    // Abrir Modal de Editar Reseña
    openEditModal(review: Review): void {
        this.modalService.close();
        this.selectedReview = review;
        this.currentModalContext = 'review';
        this.modalService.openCustom('Edit Review');
    }

    // Abrir Modal de Agregar película a Playlist
    openAddPlaylistModal(): void {
        this.currentModalContext = 'playlist';
        this.modalService.openCustom('Add to Playlist');
    }

    // ! -------- Confirmación y Eliminación de Reseñas --------
    confirmDeleteReview(reviewId: number): void {
        this.modalService.openConfirm(
            'Delete Review',
            'Are you sure you want to delete this review?',
            () => this.deleteReview(reviewId),
        );
    }

    private deleteReview(reviewId: number): void {
        this.rService.deleteReview(reviewId).subscribe({
            next: () => {
                this.modalService.openAlert(
                    'Deleted',
                    'The review was successfully deleted.',
                    'success',
                );
                this.refreshReviews();
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not delete the review.', 'error');
            },
        });
    }

    // ? ----- Refrescar Reseñas -----
    refreshReviews(): void {
        if (!this.chosenMovie) return;
        this.loadReviews(this.chosenMovie.id, this.currentPage);
        if (this.currentUsername) {
            this.getCurrentUserReview(this.currentUsername, this.chosenMovie.id);
        }
    }

    // * -------- Método para reemplazar imagen de póster fallida --------
    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/movie-noimg.jpg';
    }
}