import { Component, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Footer } from './shared/components/footer/footer';
import { ModalService } from './shared/services/modal-services';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, Header, Sidebar, Footer],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    // * ---- Titulo de la aplicacion ----
    protected readonly title = signal('Common Room'); 

    // * ---- Servicio de Modales Global ----
    public modalService = inject(ModalService);

    // * ---- Estados para el Layout y Navegacion ----
    showLayout = signal<boolean>(true); // Control de renderizado para Header, Sidebar y Footer
    isSidebarOpen = signal<boolean>(false); // Estado de apertura de la barra lateral

    constructor(private router: Router) {
        /* ------ Suscripción a eventos de navegación para control de Layout ------ */
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                // Limpiamos la URL de query params y fragmentos (Ej: /login?error=true)
                const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];

                // Rutas donde NO se debe renderizar el layout principal
                const hideFor = ['/login', '/register', '/404'];

                this.showLayout.set(!hideFor.includes(cleanUrl));
            });
    }

    /* ------ Metodo para alternar la visibilidad de la barra lateral ------ */
    onToggleSidebar(): void {
        this.isSidebarOpen.update((prev) => !prev);
    }

    /* ------ Metodo para cerrar la barra lateral ------ */
    closeSidebar(): void {
        this.isSidebarOpen.set(false);
    }
}