import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { User, Review, PlaylistPreview } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { ReviewService } from '../../../core/services/review-service';
import { PlaylistService } from '../../../core/services/playlist-service';
import { AuthService } from '../../../core/services/auth-service';
import { UserbanService } from '../../../core/services/userban-service';
import { ModalService } from '../../../shared/services/modal-services';

import { ReviewCard } from '../../../shared/cards/review-card/review-card';
import { Modal } from '../../../shared/modals/modal/modal';
import { EditProfileModal } from '../../../shared/modals/edit-profile-modal/edit-profile-modal';
import { ReviewFormModal } from '../../../shared/modals/review-form-modal/review-form-modal';
import { BanReasonModal } from '../../../shared/modals/ban-reason-modal/ban-reason-modal';

// ! Lista de palabras clave reservadas para rutas de usuario
const RESERVED_USERNAMES = ['all', 'null', 'undefined', 'config', 'api', 'root', 'system'];

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ReviewCard,
        Modal,
        EditProfileModal,
        ReviewFormModal,
        BanReasonModal,
    ],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit, OnDestroy {
    // * ======== Inyección de Servicios ========
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private uService = inject(UserService);
    private rService = inject(ReviewService);
    private pService = inject(PlaylistService);
    private userBanService = inject(UserbanService); // <--- Servicio de baneo
    private auth = inject(AuthService);
    public modalService = inject(ModalService);
    private titleService = inject(Title);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Variables de Estado ========
    selectedUser: User | null = null;
    currentUsername: string | null = null;
    isLoadingUser: boolean = true;
    isMyProfile: boolean = false;
    isAdmin: boolean = false;
    userNotFound: boolean = false;

    // ? ----- Control de Vista por Pestañas (Tabs) -----
    activeTab: 'reviews' | 'playlists' = 'reviews';

    // ? ----- Control de Modales -----
    activeModal: 'profile' | 'review' | 'ban' | null = null;
    selectedReview: Review | null = null;

    // ? ----- Paginación de Reseñas -----
    reviews: Review[] = [];
    currentPage: number = 1;
    totalPages: number = 1;
    totalElements: number = 0;
    isLoadingReviews: boolean = false;

    // ? ----- Paginación y Estado de Playlists -----
    playlists: PlaylistPreview[] = [];
    currentPlaylistPage: number = 1;
    totalPlaylistPages: number = 1;
    totalPlaylistElements: number = 0;
    isLoadingPlaylists: boolean = false;

    // Suscripción a los cambios de parámetros de la ruta
    private routeSubscription!: Subscription;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.currentUsername = this.auth.getUsername();
        this.isAdmin = this.auth.getUserRole() === 'ADMIN';

        // Escucha cambios en los parámetros de ruta (/users/:username)
        this.routeSubscription = this.route.params.subscribe((params) => {
            const username = params['username']?.trim();

            // ! <----- Redirección si se usa una palabra reservada ----->
            if (username && RESERVED_USERNAMES.includes(username.toLowerCase())) {
                this.router.navigate(['/404']);
                return;
            }

            if (username) {
                this.isMyProfile = this.currentUsername === username;
                this.loadUser(username);
                this.loadReviews(username, 1);
                this.loadPlaylists(username, 1);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    // ? ----- Selector de Pestaña Activa -----
    setTab(tab: 'reviews' | 'playlists'): void {
        this.activeTab = tab;
    }

    // ! -------- Método para cargar el Perfil del Usuario --------
    loadUser(username: string): void {
        this.isLoadingUser = true;
        this.userNotFound = false;

        this.uService.getUserProfile(username).subscribe({
            next: (data) => {
                this.selectedUser = data;

                if (data && data.username) {
                    this.titleService.setTitle(`${data.username}'s Profile | Common Room`);
                }

                this.isLoadingUser = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar perfil de usuario:', e);
                this.selectedUser = null;
                this.userNotFound = true;
                this.titleService.setTitle('User Not Found | Common Room');
                this.isLoadingUser = false;
                this.cdr.markForCheck();
            },
        });
    }

    // ! -------- Método para cargar Playlists del Usuario --------
    loadPlaylists(username: string, page: number): void {
        this.isLoadingPlaylists = true;
        this.currentPlaylistPage = page;

        const playlistReq$ = this.isMyProfile
            ? this.pService.getMyPlaylists(page)
            : this.pService.getUserPlaylists(username, page);

        playlistReq$.subscribe({
            next: (pageData) => {
                this.playlists = pageData.content;
                this.totalPlaylistPages = pageData.totalPages || 1;
                this.totalPlaylistElements = pageData.totalElements || 0;
                this.isLoadingPlaylists = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar playlists:', e);
                this.resetPlaylistState();
            },
        });
    }

    // <----- NUEVO: Helper privado para resetear estado de playlists ----->
    private resetPlaylistState(): void {
        this.playlists = [];
        this.totalPlaylistPages = 1;
        this.totalPlaylistElements = 0;
        this.isLoadingPlaylists = false;
        this.cdr.markForCheck();
    }

    // ? ----- Cambio de Página de Playlists -----
    changePlaylistPage(newPage: number): void {
        if (this.selectedUser && newPage >= 1 && newPage <= this.totalPlaylistPages) {
            this.currentPlaylistPage = newPage;
            this.loadPlaylists(this.selectedUser.username, this.currentPlaylistPage);
        }
    }

    // ! -------- Método para cargar Reseñas del Usuario --------
    loadReviews(username: string, page: number): void {
        this.isLoadingReviews = true;
        this.currentPage = page;

        this.rService.getReviewsForUser(username, page).subscribe({
            next: (pageData) => {
                this.reviews = pageData.content;
                this.totalPages = pageData.totalPages || 1;
                this.totalElements = pageData.totalElements || 0;
                this.isLoadingReviews = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error al cargar reseñas del usuario:', e);
                this.resetReviewState();
            },
        });
    }

    private resetReviewState(): void {
        this.reviews = [];
        this.totalPages = 1;
        this.totalElements = 0;
        this.isLoadingReviews = false;
        this.cdr.markForCheck();
    }

    // ? ----- Cambio de Página -----
    changePage(newPage: number): void {
        if (this.selectedUser && newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.loadReviews(this.selectedUser.username, this.currentPage);
        }
    }

    // ! -------- Gestión de Modales y Edición --------
    openEditModal(): void {
        this.activeModal = 'profile';
        this.modalService.openCustom('Account Settings');
    }

    onEditReview(review: Review): void {
        this.selectedReview = review;
        this.activeModal = 'review';
        this.modalService.openCustom('Edit Review');
    }

    onReviewUpdated(): void {
        if (this.selectedUser) {
            this.loadReviews(this.selectedUser.username, this.currentPage);
        }
    }

    // ! -------- Eliminación de Reseñas --------
    onDeleteReview(reviewId: number): void {
        this.modalService.openConfirm(
            'Delete Review',
            'Are you sure you want to delete this review?',
            () => {
                this.rService.deleteReview(reviewId).subscribe({
                    next: () => {
                        this.modalService.openAlert(
                            'Deleted',
                            'Review deleted successfully.',
                            'success',
                        );
                        if (this.selectedUser) {
                            this.loadReviews(this.selectedUser.username, this.currentPage);
                        }
                    },
                    error: (e) => {
                        console.error(e);
                        this.modalService.openAlert(
                            'Error',
                            'Could not delete the review.',
                            'error',
                        );
                    },
                });
            },
        );
    }

    // ! -------- Eliminación de Cuenta de Usuario --------
    deleteUser(): void {
        if (!this.selectedUser) return;

        this.modalService.openConfirm(
            'Delete Account',
            'Are you sure you want to delete your profile? This action is permanent.',
            () => {
                this.uService.deleteUser(this.selectedUser!.username).subscribe({
                    next: () => {
                        this.modalService.openAlert(
                            'Deleted',
                            'Your account was deleted successfully.',
                            'success',
                        );
                        this.auth.logout();
                        this.router.navigate(['/']);
                    },
                    error: (e) => {
                        console.error(e);
                        this.modalService.openAlert(
                            'Error',
                            'Could not delete user account.',
                            'error',
                        );
                    },
                });
            },
        );
    }

    // <----- Banear Usuario (Exclusivo Admin) ----->
    banUser(): void {
        if (!this.selectedUser) return;

        this.activeModal = 'ban';
        this.modalService.openCustom(`Ban User: @${this.selectedUser.username}`);
    }

    // Callback llamado por (confirmed) del modal
    onConfirmBan(reason: string): void {
        if (!this.selectedUser) return;

        const targetUsername = this.selectedUser.username;

        this.userBanService.banUser(targetUsername, reason).subscribe({
            next: () => {
                this.modalService.close();
                this.modalService.openAlert(
                    'Banned',
                    `User @${targetUsername} has been successfully banned.`,
                    'success',
                );
                this.router.navigate(['/movies']);
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not ban the user.', 'error');
            },
        });
    }

    // ? ----- Refrescar Datos de Perfil -----
    refreshProfileData(newUsername?: string): void {
        const targetUsername = newUsername || this.auth.getUsername();

        if (targetUsername) {
            if (targetUsername !== this.selectedUser?.username) {
                this.router.navigate(['/users', targetUsername]);
            } else {
                this.loadUser(targetUsername);
                this.loadReviews(targetUsername, this.currentPage);
                this.loadPlaylists(targetUsername, this.currentPlaylistPage);
            }
        }
    }

    // * -------- Métodos para reemplazar imagen de perfil/playlist fallida --------
    noProfilePicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        const defaultPath =
            this.selectedUser?.role === 'ADMIN'
                ? 'assets/img/default-img/admin-noimg.jpg'
                : 'assets/img/default-img/user-noimg.jpg';
        img.src = defaultPath;
    }

    noPlaylistPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/playlist-noimg.jpg';
    }
}
