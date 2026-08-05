import { Component, OnInit, inject, signal } from '@angular/core';
import { MovieBase } from '../../core/models';
import { MovieService } from '../../core/services/movie-service';
import { MovieCarouselComponent } from '../../shared/components/movie-carousel/movie-carousel';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [MovieCarouselComponent],
    templateUrl: './home-page.html',
    styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
    // * ---- Inyección de Dependencias ----
    private movieService = inject(MovieService);

    // * ---- Estados Reactivos con Signals (Listas) ----
    popularMovies = signal<MovieBase[]>([]);
    recentMovies = signal<MovieBase[]>([]);
    upcomingMovies = signal<MovieBase[]>([]);

    // * -------- Ciclo de Vida: OnInit --------
    // Se ejecuta al inicializar el componente; invoca la carga inicial de todas las listas de películas
    ngOnInit(): void {
        this.loadAllMovies();
    }

    // * -------- Métodos de Carga de Datos --------
    // Llama al servicio de películas para traer los listados de populares, recientes y próximas
    loadAllMovies(): void {
        this.movieService.getPopularMovies(1).subscribe({
            next: (data) => this.popularMovies.set(data),
            error: (err) => console.error(err),
        });

        this.movieService.getRecentMovies(1).subscribe({
            next: (data) => this.recentMovies.set(data),
            error: (err) => console.error(err),
        });

        this.movieService.getUpcomingMovies(1).subscribe({
            next: (data) => this.upcomingMovies.set(data),
            error: (err) => console.error(err),
        });
    }
}