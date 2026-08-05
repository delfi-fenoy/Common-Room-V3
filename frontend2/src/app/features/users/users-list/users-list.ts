import { Component, HostListener, OnInit, inject } from '@angular/core';
import { UserPreview } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { RouterLink } from '@angular/router';

// Tipado para los filtros de usuario
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
    allUsers: UserPreview[] = []; // Array completo descargado
    users: UserPreview[] = []; // Array de usuarios visibles en pantalla
    currentPage = 1;
    itemsPerPage = 15; // 15 elementos por tanda para completar filas de 5 columnas
    hasMorePages = true;
    isLoading = false;
    showScrollTopBtn = false;
    selectedFilter: UserFilterType = 'all'; // Filtro seleccionado por defecto

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.loadUsers();
    }

    // ! -------- Método para cargar Usuarios --------
    loadUsers(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        this.uService.getUsers().subscribe({
            next: (data) => {
                this.allUsers = data;
                this.applyFilterAndAppend();
                this.isLoading = false;
            },
            error: (e) => {
                console.error(e);
                this.isLoading = false;
            },
        });
    }

    // ! -------- Filtrado y Paginación Local --------
    private applyFilterAndAppend(): void {
        // 1. Aplica el filtro seleccionado
        let filtered = [...this.allUsers];
        if (this.selectedFilter === 'admins') {
            filtered = filtered.filter((u) => u.role === 'ADMIN');
        } else if (this.selectedFilter === 'members') {
            filtered = filtered.filter((u) => u.role !== 'ADMIN');
        }

        // 2. Realiza el corte por página
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const newBatch = filtered.slice(startIndex, endIndex);

        if (newBatch.length > 0) {
            this.users = [...this.users, ...newBatch];
            this.hasMorePages = this.users.length < filtered.length;
        } else {
            this.hasMorePages = false;
        }
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
        this.currentPage = 1;
        this.users = [];
        this.hasMorePages = true;
        this.applyFilterAndAppend();
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
            this.currentPage++;
            this.applyFilterAndAppend();
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
