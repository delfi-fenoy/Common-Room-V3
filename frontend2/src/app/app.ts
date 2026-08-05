import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Footer } from './shared/components/footer/footer';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, Header, Sidebar, Footer],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    private router = inject(Router);
    protected readonly title = signal('frontend2');

    // <----- Control del Layout (Header/Sidebar/Footer) ----->
    showLayout = signal<boolean>(true);

    // <----- Estado para la barra lateral / sidebar ----->
    isSidebarOpen = signal<boolean>(false);

    constructor() {
        // Escuchamos la navegación para ocultar o mostrar el layout según la URL
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                // Limpiamos la URL de query params para evitar fallos (Ej: /login?error=true)
                const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];

                // Rutas donde NO se debe renderizar el layout
                const hideFor = ['/login', '/register', '/404'];

                this.showLayout.set(!hideFor.includes(cleanUrl));
            });
    }

    // <----- Toggle Sidebar State ----->
    onToggleSidebar(): void {
        this.isSidebarOpen.update((prev) => !prev);
    }

    // <----- Close Sidebar ----->
    closeSidebar(): void {
        this.isSidebarOpen.set(false);
    }
}
