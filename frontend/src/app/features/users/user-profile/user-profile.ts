import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { User, Review } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { ReviewService } from '../../../core/services/review-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';

import { ReviewCard } from '../../../shared/components/review-card/review-card';
import { Modal } from '../../../shared/components/modal/modal';
import { EditProfileModal } from '../../../shared/components/edit-profile-modal/edit-profile-modal';
import { ReviewFormModal } from '../../../shared/components/review-form-modal/review-form-modal';

// ! Lista de palabras clave reservadas para rutas de usuario
const RESERVED_USERNAMES = ['all', 'null', 'undefined', 'config', 'api', 'root', 'system'];

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, ReviewCard, Modal, EditProfileModal, ReviewFormModal],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit, OnDestroy {
    // * ======== Inyección de Servicios ========
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private uService = inject(UserService);
    private rService = inject(ReviewService);
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

    // ? ----- Control de Modales -----
    activeModal: 'profile' | 'review' | null = null;
    selectedReview: Review | null = null;

    // ? ----- Paginación de Reseñas -----
    reviews: Review[] = [];
    currentPage: number = 1;
    totalPages: number = 1;
    totalElements: number = 0;
    isLoadingReviews: boolean = false;

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
            }
        });
    }

    ngOnDestroy(): void {
        // Limpieza de suscripción al destruir el componente
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
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
                this.reviews = [];
                this.totalPages = 1;
                this.totalElements = 0;
                this.isLoadingReviews = false;
                this.cdr.markForCheck();
            },
        });
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
                        this.modalService.openAlert('Deleted', 'Review deleted successfully.', 'success');
                        if (this.selectedUser) {
                            this.loadReviews(this.selectedUser.username, this.currentPage);
                        }
                    },
                    error: (e) => {
                        console.error(e);
                        this.modalService.openAlert('Error', 'Could not delete the review.', 'error');
                    },
                });
            }
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
                        this.modalService.openAlert('Deleted', 'Your account was deleted successfully.', 'success');
                        this.auth.logout();
                        this.router.navigate(['/']);
                    },
                    error: (e) => {
                        console.error(e);
                        this.modalService.openAlert('Error', 'Could not delete user account.', 'error');
                    },
                });
            }
        );
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
            }
        }
    }

    // * -------- Método para reemplazar imagen de perfil fallida --------
    noProfilePicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/user-noimg.jpg';
    }
}