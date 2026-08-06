import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { MovieBase } from '../../../core/models';
import { MovieService } from '../../../core/services/movie-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Filtro de películas: relevancia, popularidad, recientes o próximas
export type MovieFilterType = 'relevance' | 'popular' | 'recent' | 'upcoming';

export const TMDB_GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
];

@Component({
    selector: 'app-movies-list', 
    imports: [RouterLink, FormsModule],
    templateUrl: './movies-list.html', 
    styleUrl: './movies-list.css',
})
export class MoviesList implements OnInit {
    // * ======== Inyección de Servicios ========
    public mService = inject(MovieService);
    private cdr = inject(ChangeDetectorRef); // <----- Inyección del detector de cambios
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // * ======== Variables de Estado ========
    movies: MovieBase[] = []; // Array peliculas visibles
    currentPage = 1; // Número de página actual para la paginación del backend
    hasMorePages = true; // Boolean para saber si el backend aun tiene más páginas disponibles
    isLoading = false; 
    showScrollTopBtn = false;
    selectedFilter: MovieFilterType = 'relevance'; // Por defecto

    selectedYear: string = '';
    selectedGenre: number | null = null;
    genresList = TMDB_GENRES;
    yearsList: number[] = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => 2026 - i); // Array de años desde 2026 hasta 1900

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            // <----- Validación limpia de género desde la URL ----->
            const rawGenre = params['genre'];
            const parsedGenre = Number(rawGenre);
            this.selectedGenre = rawGenre && !isNaN(parsedGenre) ? parsedGenre : null;
            
            this.selectedYear = params['year'] || '';
            this.resetAndReload();
        });
    }

    // ! -------- Método para cargar películas --------
    loadMovies(): void {
        if (this.isLoading || !this.hasMorePages) return; // Controla si ya hay una petición en curso o si no quedan más páginas
        this.isLoading = true; // Sppiner de cargando

        let request$: Observable<MovieBase[]>;

        if (this.selectedYear || this.selectedGenre !== null) {
            request$ = this.mService.searchOrDiscoverMovies(
                this.currentPage,
                undefined,
                this.selectedYear,
                this.selectedGenre ?? undefined
            );
        } else {
            request$ = this.getMoviesByFilter(this.selectedFilter, this.currentPage);
        }

        // Llama al método correspondiente según el filtro y la página actual
        request$.subscribe({
            next: (data) => {
                this.movies = [...this.movies, ...data]; // Concatena las 20 películas recibidas al array existente
                this.hasMorePages = data.length === 20; // Verifica si agrega 20 peliculas mas, Si no llego al final
                this.isLoading = false; // Desactiva el sppiner de cargando
                this.cdr.detectChanges(); // Fuerza a Angular a detectar los cambios y renderizar el DOM de inmediato
            },
            error: (e) => {
                console.error(e);
                this.isLoading = false; // Desactiva el sppiner de cargando
                this.cdr.detectChanges();
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

    // ? --- Selector de género --- 
    onGenreSelect(event: Event): void {
        const val = (event.target as HTMLSelectElement).value;
        const parsed = Number(val);
        
        // <----- Si el valor es vacío o NaN, se asigna null ----->
        this.selectedGenre = val && !isNaN(parsed) ? parsed : null;
        this.resetAndReload();
    }

    // ? --- Selector de año --- 
    onYearSelect(event: Event): void {
        this.selectedYear = (event.target as HTMLSelectElement).value;
        this.resetAndReload();
    }
    
    // ! -------- Método para recargar--------
    private resetAndReload(): void {
        this.currentPage = 1;
        this.movies = [];
        this.hasMorePages = true;
        setTimeout(() => {
            this.loadMovies();
        }, 0);
    }

    // ! -------- Método para cambiar el filtro --------
    changeFilter(filter: MovieFilterType): void {
        this.selectedFilter = filter;

        // <----- Reset de género y año al seleccionar un Sort By ----->
        this.selectedGenre = null;
        this.selectedYear = '';

        // <----- Limpiar QueryParams de la URL ----->
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
        });

        this.resetAndReload();
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