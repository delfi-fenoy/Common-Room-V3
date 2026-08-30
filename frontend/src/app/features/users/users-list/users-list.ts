import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { UserPreview } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
    private route = inject(ActivatedRoute); // Inyección para leer parámetros de URL
    private router = inject(Router); // Inyección para redireccionar
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

    // ! -------- Método para cargar Usuarios desde el Backend --------
    loadUsers(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        const roleParam = this.selectedFilter !== 'all' ? this.selectedFilter : undefined;

        this.uService.getUsers(this.currentPage, this.itemsPerPage, roleParam).subscribe({
            next: (pageResponse) => {
                this.users = [...this.users, ...pageResponse.content]; // Anexa los nuevos registros
                this.hasMorePages = !pageResponse.last; // Determina si quedan páginas
                this.isLoading = false;
                this.cdr.detectChanges(); // Fuerza actualización en caso de éxito
            },
            error: (e) => {
                console.error('Error al obtener la lista de usuarios:', e);
                this.isLoading = false;
                this.cdr.detectChanges();
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
        this.currentPage = 1; // Reinicia la página para la nueva consulta
        this.users = []; // Limpia la lista previa
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
            this.currentPage++; // Incrementa la página y solicita la siguiente tanda
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
        img.src = role === 'ADMIN'
            ? 'assets/img/default-img/admin-noimg.jpg'
            : 'assets/img/default-img/user-noimg.jpg';
    }
}