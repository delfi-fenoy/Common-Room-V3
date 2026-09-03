import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserPreview } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';

export type UserFilterType = 'all' | 'ADMIN' | 'USER';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './users-list.html',
    styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
    // * ======== Inyección de Servicios ========
    public uService = inject(UserService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Variables de Estado ========
    users: UserPreview[] = [];
    currentPage = 1;
    itemsPerPage = 10;
    hasMorePages = true;
    isLoading = false;
    showScrollTopBtn = false;
    selectedFilter: UserFilterType = 'all';

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // Redirección a 404 si la URL contiene query params no permitidos (ej: /users?role=ADMIN)
        if (Object.keys(this.route.snapshot.queryParams).length > 0) {
            this.router.navigate(['/404']);
            return;
        }

        this.loadUsers();
    }

    // <----- Cargar Lista de Usuarios ----->
    loadUsers(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        const roleParam = this.selectedFilter !== 'all' ? this.selectedFilter : undefined;

        this.uService.getUsers(this.currentPage, this.itemsPerPage, roleParam).subscribe({
            next: (pageResponse) => {
                this.users = [...this.users, ...pageResponse.content];
                this.hasMorePages = !pageResponse.last;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error al obtener la lista de usuarios:', e);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    // <----- Handler de Cambio de Filtro ----->
    onFilterSelect(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        this.changeFilter(selectElement.value as UserFilterType);
    }

    changeFilter(filter: UserFilterType): void {
        if (this.selectedFilter === filter) return;
        this.selectedFilter = filter;
        this.currentPage = 1;
        this.users = [];
        this.hasMorePages = true;

        this.loadUsers();
    }

    // <----- Listener de Scroll Infinito ----->
    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        this.showScrollTopBtn = window.scrollY > 400;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 600;

        if (
            scrollPosition >= threshold &&
            !this.isLoading &&
            this.hasMorePages &&
            this.users.length > 0
        ) {
            this.currentPage++;
            this.loadUsers();
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