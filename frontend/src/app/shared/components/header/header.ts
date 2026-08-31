import { Component, EventEmitter, Output, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../services/modal-services';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header implements OnInit {
    // * ---- Inyección de Dependencias ----
    private router = inject(Router);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);

    // * ---- Variables de Estado de Búsqueda ----
    searchQuery: string = '';
    isSearchFocused: boolean = false;

    // * ---- Variables de Usuario / Autenticación ----
    isLoggedIn: boolean = false;
    currentUser: string | null = null;

    // * ---- Eventos hacia el Padre (Comunicación "de hijo a padre") ----
    @Output() toggleSidebarEvent = new EventEmitter<void>();

    // * ====== ngOnInit ======
    ngOnInit(): void {
        this.authService.loggedIn$.subscribe((value) => {
            this.isLoggedIn = value;
            setTimeout(() => this.cdr.detectChanges()); // Asincronía para prevenir error NG0100
        });

        this.authService.username$.subscribe((username) => {
            this.currentUser = username;
            setTimeout(() => this.cdr.detectChanges()); // Asincronía para prevenir error NG0100
        });

        // Escuchar eventos de navegación para limpiar el input si se sale de /search
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (!event.urlAfterRedirects.startsWith('/search/')) {
                    this.searchQuery = '';
                }
            });
    }

    // * -------- Métodos del Buscador --------
    onSearchFocus(): void {
        this.isSearchFocused = true;
    }

    onSearchBlur(): void {
        setTimeout(() => {
            this.isSearchFocused = false;
        }, 150);
    }

    onSearch(): void {
        if (this.searchQuery.trim()) {
            this.isSearchFocused = false;
            // Redirección a Search Page
            this.router.navigate(['/search', this.searchQuery.trim()]);
        }
    }

    // * -------- Métodos de Interacción y Sesión --------
    toggleSidebar(): void {
        this.toggleSidebarEvent.emit();
    }

    logout(): void {
        this.modalService.openConfirm(
            'Log Out',
            'Are you sure you want to log out of your account?',
            () => {
                this.authService.logout();
            },
        );
    }
}