import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MovieBase } from '../../../core/models';
import { MovieService } from '../../../core/services/movie-service';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

// Filtro de películas: relevancia, popularidad, recientes o próximas
export type MovieFilterType = 'relevance' | 'popular' | 'recent' | 'upcoming';

@Component({
    selector: 'app-movies-list', 
    imports: [RouterLink], 
    templateUrl: './movies-list.html', 
    styleUrl: './movies-list.css',
})
export class MoviesList implements OnInit {
    // * ======== Inyección de Servicios ========
    public mService = inject(MovieService);

    // * ======== Variables de Estado ========
    movies: MovieBase[] = []; // Array peliculas visibles
    currentPage = 1; // Número de página actual para la paginación del backend
    hasMorePages = true; // Boolean para saber si el backend aun tiene más páginas disponibles
    isLoading = false; 
    showScrollTopBtn = false;
    selectedFilter: MovieFilterType = 'relevance'; // Por defecto

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.loadMovies();
    }

    // ! -------- Método para cargar películas --------
    loadMovies(): void {
        if (this.isLoading || !this.hasMorePages) return; // Controla si ya hay una petición en curso o si no quedan más páginas
        this.isLoading = true; // Sppiner de cargando

        // Llama al método correspondiente según el filtro y la página actual
        this.getMoviesByFilter(this.selectedFilter, this.currentPage).subscribe({
            next: (data) => {
                this.movies = [...this.movies, ...data]; // Concatena las 20 películas recibidas al array existente
                this.hasMorePages = data.length === 20; // Verifica si agrega 20 peliculas mas, Si no llego al final
                this.isLoading = false; // Desactiva el sppiner de cargando
            },
            error: (e) => {
                console.error(e);
                this.isLoading = false; // Desactiva el sppiner de cargando
            },
        });
    }

    // ! -------- Método Switch para obtener películas por filtro --------
    private getMoviesByFilter(filter: MovieFilterType, page: number): Observable<MovieBase[]> {
        switch (filter) {
            case 'popular':
                return this.mService.getPopularMovies(page);
            case 'recent':
                return this.mService.getRecentMovies(page);
            case 'upcoming':
                return this.mService.getUpcomingMovies(page);
            case 'relevance':
            default:
                return this.mService.getAllMovies(page);
        }
    }

    // ? --- Selector del filtro --- 
    onFilterSelect(event: Event): void {
        const selectElement = event.target as HTMLSelectElement; // Castea el elemento a HTMLSelectElement para acceder a su valor
        this.changeFilter(selectElement.value as MovieFilterType); // Llama al método para cambiar el filtro con el valor seleccionado
    }

    // ! -------- Método para cambiar el filtro --------
    changeFilter(filter: MovieFilterType): void {
        // Evita re-ejecutar la lógica si el usuario selecciona el filtro que ya está activo
        if (this.selectedFilter === filter) return;
        // Actualiza la variable del filtro seleccionado
        this.selectedFilter = filter;
        // Resetea el contador de páginas a la primera página
        this.currentPage = 1;
        // Vacía la lista actual de películas en pantalla
        this.movies = [];
        // Restablece la bandera indicando que hay nuevas páginas por consultar
        this.hasMorePages = true;
        // Dispara la carga inmediata para el nuevo filtro
        this.loadMovies();
    }

    // ! -------- Listener de Scroll Global --------
    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        this.showScrollTopBtn = window.scrollY > 400; // Despues de 400px, el botón aparece

        // Lógica para disparar el Scroll Infinito
        const scrollPosition = window.innerHeight + window.scrollY; // Posición actual del scroll desde la parte superior de la ventana
        const threshold = document.documentElement.scrollHeight - 600; // Umbral de 600px desde el final de la página para cargar más películas

        // Si sobrepasa el umbral y cumple las condiciones requeridas, pide otra tanda de películas
        if (scrollPosition >= threshold && !this.isLoading && this.hasMorePages && this.movies.length > 0) {
            this.currentPage++;
            this.loadMovies();
        }
    }

    // ? ----- Método para volver hacia arriba -----
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // * -------- Método para reemplazar posters sin imagen --------
    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/movie-noimg.jpg';
    }
}