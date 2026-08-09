import { Component, EventEmitter, Output, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { Modal } from '../modal/modal';
import { ModalService } from '../../services/modal-services';

@Component({
    selector: 'app-header',
    imports: [RouterLink, FormsModule, Modal],
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
        // Escucha el estado de sesión del usuario
        this.authService.loggedIn$.subscribe((value) => {
            this.isLoggedIn = value;
            setTimeout(() => this.cdr.detectChanges()); // <----- Asincronía para prevenir error NG0100 ----->
        });

        // Escucha el nombre del usuario logueado
        this.authService.username$.subscribe((username) => {
            this.currentUser = username;
            setTimeout(() => this.cdr.detectChanges()); // <----- Asincronía para prevenir error NG0100 ----->
        });

        // Escucha los cambios de ruta para limpiar la barra si no está en búsquedas
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (!event.urlAfterRedirects.includes('/movies/search/')) {
                    this.searchQuery = '';
                }
            });
    }

    // * -------- Métodos del Buscador (Backdrop / Focus) --------
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
            this.router.navigate(['/movies/search', this.searchQuery.trim()]);
        }
    }

    // * -------- Métodos de Interacción y Sesión --------
    toggleSidebar(): void {
        this.toggleSidebarEvent.emit();
    }

    // <----- Modal de Confirmación para Logout ----->
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