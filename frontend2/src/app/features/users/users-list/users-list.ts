import { Component, HostListener, OnInit, inject } from '@angular/core';
import { UserPreview } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { RouterLink } from '@angular/router';

export type UserFilterType = 'all' | 'admins' | 'members';

@Component({
    selector: 'app-users-list',
    imports: [RouterLink],
    templateUrl: './users-list.html',
    styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
    // * ======== Inyección de Servicios ========
    public uService = inject(UserService);

    // * ======== Variables de Estado ========
    users: UserPreview[] = []; // Array de usuarios visibles en pantalla
    currentPage = 1;
    hasMorePages = true;
    isLoading = false;
    showScrollTopBtn = false;
    selectedFilter: UserFilterType = 'all'; // Filtro seleccionado por defecto

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.loadUsers();
    }

    // ! -------- Método para cargar Usuarios Paginados desde Backend --------
    loadUsers(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        this.uService.getUsersPaged(this.selectedFilter, this.currentPage).subscribe({
            next: (pageData) => {
                // <----- Concatenar nuevos usuarios recuperados de la DB ----->
                this.users = [...this.users, ...pageData.content];

                // <----- Verificar si es la última página ----->
                this.hasMorePages = !pageData.last;
                this.isLoading = false;
            },
            error: (e) => {
                console.error(e);
                this.isLoading = false;
            },
        });
    }

    // ? --- Selector del filtro ---
    onFilterSelect(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        this.changeFilter(selectElement.value as UserFilterType);
    }

    // ! -------- Método para cambiar el filtro --------
    changeFilter(filter: UserFilterType): void {
        if (this.selectedFilter === filter) return;
        this.selectedFilter = filter;
        
        // <----- Reiniciar paginación y vista ----->
        this.currentPage = 1;
        this.users = [];
        this.hasMorePages = true;
        this.loadUsers();
    }

    // ! -------- Listener de Scroll Global --------
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
            // <----- Solicitar siguiente página al Backend ----->
            this.currentPage++;
            this.loadUsers();
        }
    }

    // ? ----- Método para volver hacia arriba -----
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // * -------- Método para reemplazar fotos de perfil sin imagen o fallidas --------
    noProfilePicture(event: Event, role?: string): void {
        const img = event.target as HTMLImageElement;
        if (role === 'ADMIN') {
            img.src = 'assets/img/default-img/admin-noimg.jpg';
        } else {
            img.src = 'assets/img/default-img/user-noimg.jpg';
        }
    }
}