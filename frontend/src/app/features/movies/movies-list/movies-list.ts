import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { MoviePreview } from '../../../core/models';
import { MovieService } from '../../../core/services/movie-service';
import { MovieCard } from '../../../shared/cards/movie-card/movie-card';

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
    { id: 37, name: 'Western' },
];

@Component({
    selector: 'app-movies-list',
    standalone: true,
    imports: [FormsModule, MovieCard],
    templateUrl: './movies-list.html',
    styleUrl: './movies-list.css',
})
export class MoviesList implements OnInit {
    // * ======== Inyección de Servicios ========
    public mService = inject(MovieService);
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // * ======== Variables de Estado y Filtros ========
    movies: MoviePreview[] = [];
    currentPage = 1;
    hasMorePages = true;
    isLoading = false;
    showScrollTopBtn = false;

    selectedFilter: MovieFilterType = 'relevance';
    selectedYear: string = '';
    selectedGenre: number | null = null;
    genresList = TMDB_GENRES;
    yearsList: number[] = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => 2026 - i);

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        // * Escucha cambios en los QueryParams para mantener sincronizados los filtros y la URL
        this.route.queryParams.subscribe((params) => {
            // Validar Género en URL
            const rawGenre = params['genre'];
            if (rawGenre !== undefined && rawGenre !== '') {
                const parsedGenre = Number(rawGenre);
                const existsGenre =
                    !isNaN(parsedGenre) && this.genresList.some((g) => g.id === parsedGenre);

                // ! Si el parámetro género no existe en la lista, redirige a 404
                if (!existsGenre) {
                    this.router.navigate(['/404']);
                    return;
                }
                this.selectedGenre = parsedGenre;
            } else {
                this.selectedGenre = null;
            }

            // Validar Año en URL
            const rawYear = params['year'];
            if (rawYear !== undefined && rawYear !== '') {
                const parsedYear = Number(rawYear);
                const existsYear = !isNaN(parsedYear) && this.yearsList.includes(parsedYear);

                if (!existsYear) {
                    this.router.navigate(['/404']);
                    return;
                }
                this.selectedYear = rawYear;
            } else {
                this.selectedYear = '';
            }

            // Validar Orden (Filter)
            this.selectedFilter = params['filter']
                ? (params['filter'] as MovieFilterType)
                : 'relevance';

            this.resetAndReload();
        });
    }

    // <----- Cargar Películas según Filtros y Página ----->
    loadMovies(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        let request$: Observable<MoviePreview[]>;

        if (this.selectedYear || this.selectedGenre !== null) {
            request$ = this.mService.searchOrDiscoverMovies(
                this.currentPage,
                undefined,
                this.selectedYear,
                this.selectedGenre ?? undefined,
            );
        } else {
            request$ = this.getMoviesByFilter(this.selectedFilter, this.currentPage);
        }

        // * Llama al método correspondiente según el filtro y la página actual
        request$.subscribe({
            next: (data) => {
                // ! Evita duplicados filtrando por ID
                const newMovies = data.filter(
                    (newMovie) => !this.movies.some((existing) => existing.id === newMovie.id),
                );

                this.movies = [...this.movies, ...newMovies]; // Concatena las películas recibidas al array existente
                this.hasMorePages = data.length === 20; // Verifica si agrega 20 peliculas mas, Si no llego al final
                this.isLoading = false; // Desactiva el sppiner de cargando
                this.cdr.detectChanges(); // Fuerza a Angular a detectar los cambios y renderizar el DOM de inmediato
            },
            error: (e) => {
                console.error(e);
                this.isLoading = false; // Desactiva el sppiner de cargando
                this.hasMorePages = false; // Cancela más peticiones si el backend devuelve un error (ej: 400)
                this.cdr.detectChanges();
            },
        });
    }

    // <----- Selector de Petición por Filtro ----->
    private getMoviesByFilter(filter: MovieFilterType, page: number): Observable<MoviePreview[]> {
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

    // <----- Handlers de Cambios de Filtro ----->
    onFilterChange(newFilter: MovieFilterType): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: newFilter !== 'relevance' ? { filter: newFilter } : {},
        });
    }

    // ? --- Evento al cambiar el Género ---
    onGenreChange(newGenre: number | null): void {
        this.updateQueryParams({ genre: newGenre });
    }

    onYearChange(newYear: string): void {
        this.updateQueryParams({ year: newYear });
    }

    // <----- Actualización de QueryParams en la URL ----->
    private updateQueryParams(updated: { genre?: number | null; year?: string }): void {
        const queryParams: any = { ...this.route.snapshot.queryParams };

        if ('genre' in updated) {
            if (updated.genre !== null && updated.genre !== undefined) {
                queryParams.genre = updated.genre;
            } else {
                delete queryParams.genre;
            }
        }

        if ('year' in updated) {
            if (updated.year) {
                queryParams.year = updated.year;
            } else {
                delete queryParams.year;
            }
        }

        // * Se elimina el parametro filter al aplicar filtros de género o año
        delete queryParams.filter;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
        });
    }

    // <----- Resetear Lista al Cambiar Filtros ----->
    private resetAndReload(): void {
        this.currentPage = 1;
        this.movies = [];
        this.hasMorePages = true;
        this.loadMovies();
    }

    // <----- Listener de Scroll Infinito y Botón 'Scroll To Top' ----->
    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        this.showScrollTopBtn = window.scrollY > 400;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 600;

        if (
            scrollPosition >= threshold &&
            !this.isLoading &&
            this.hasMorePages &&
            this.movies.length > 0
        ) {
            this.currentPage++;
            this.loadMovies();
        }
    }

    // <----- Desplazar suavemente arriba ----->
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}