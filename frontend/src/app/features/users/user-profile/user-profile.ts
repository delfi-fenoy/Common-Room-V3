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

// <----- Lista de palabras clave reservadas / rutas no válidas para nombres de usuario ----->
const RESERVED_USERNAMES = ['all', 'null', 'undefined', 'config', 'api', 'root', 'system'];

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, ReviewCard, Modal, EditProfileModal, ReviewFormModal, RouterLink],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.css',
})

export class UserProfile implements OnInit, OnDestroy {
    // * ---- Inyección de Dependencias ----
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private uService = inject(UserService);
    private rService = inject(ReviewService);
    private auth = inject(AuthService);
    public modalService = inject(ModalService);
    private titleService = inject(Title);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Estado del Usuario ========
    selectedUser: User | null = null;
    currentUsername: string | null = null;
    isLoadingUser = true;
    isMyProfile = false;
    isAdmin = false;
    userNotFound = false; // <----- Bandera para indicar perfil inexistente ----->

    // * ======== Control de Modales ========
    activeModal: 'profile' | 'review' | null = null;
    selectedReview: Review | null = null;

    // * ======== Paginación y Reseñas ========
    reviews: Review[] = [];
    currentPage = 1;
    totalPages = 1;
    totalElements = 0;
    isLoadingReviews = false;

    // ? <----- Suscripción a Parámetros de Ruta ----->
    private routeSubscription!: Subscription;

    // * -------- Ciclo de Vida del Componente --------
    ngOnInit(): void {
        this.currentUsername = this.auth.getUsername();
        this.isAdmin = this.auth.getUserRole() === 'ADMIN';

        // Escucha cambios en la URL (Ej: navegar de /users/ian a /users/lola sin recargar la página)
        this.routeSubscription = this.route.params.subscribe((params) => {
            const username = params['username']?.trim();

            // <----- Si intenta acceder con una palabra reservada, redirigir a 404 ----->
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
        // Desuscripción obligatoria para evitar memory leaks al destruir el componente
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    // * -------- Carga de Datos --------
    loadUser(username: string): void {
        this.isLoadingUser = true;
        this.userNotFound = false;

        this.uService.getUserProfile(username).subscribe({
            next: (data) => {
                this.selectedUser = data;
                if (data?.username) {
                    this.titleService.setTitle(`${data.username}'s Profile | Common Room`);
                }
                this.isLoadingUser = false;
                this.cdr.markForCheck();
            },
            error: (e) => {
                console.error('Error loading user profile:', e);
                this.selectedUser = null;
                this.userNotFound = true; // <----- Marca el estado no encontrado ----->
                this.titleService.setTitle('User Not Found | Common Room');
                this.isLoadingUser = false;
                this.cdr.markForCheck();
            },
        });
    }

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
                console.error('Error loading user reviews:', e);
                this.reviews = [];
                this.totalPages = 1;
                this.totalElements = 0;
                this.isLoadingReviews = false;
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Navegación entre Páginas de Reseñas ----->
    changePage(newPage: number): void {
        if (this.selectedUser && newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.loadReviews(this.selectedUser.username, this.currentPage);
        }
    }

    // * ======== Modales y Acciones ========
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

    onDeleteReview(reviewId: number): void {
        // <----- Modal de Confirmación previo a la eliminación ----->
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

    deleteUser(): void {
        if (!this.selectedUser) return;

        // <----- Modal de Confirmación para borrado definitivo de cuenta ----->
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

    // <----- Recarga o Redirección al Actualizar Datos del Perfil ----->
    refreshProfileData(newUsername?: string): void {
        const targetUsername = newUsername || this.auth.getUsername();

        if (targetUsername) {
            // Si cambió su username, redirige a la nueva ruta; si no, refresca en el lugar
            if (targetUsername !== this.selectedUser?.username) {
                this.router.navigate(['/users', targetUsername]);
            } else {
                this.loadUser(targetUsername);
                this.loadReviews(targetUsername, this.currentPage);
            }
        }
    }

    // ? <----- Fallback para Imágenes de Perfil Caídas/Nulas ----->
    noProfilePicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/userv2.jpg';
    }
}