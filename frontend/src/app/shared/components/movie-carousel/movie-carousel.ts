import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { MoviePreview } from '../../../core/models';
import { MovieCard } from '../movie-card/movie-card';

@Component({
    selector: 'app-movie-carousel',
    standalone: true,
    imports: [MovieCard], 
    templateUrl: './movie-carousel.html',
    styleUrl: './movie-carousel.css',
})
export class MovieCarouselComponent implements OnInit, OnDestroy {
    // * ---- Inputs recibidos del componente padre ----
    @Input({ required: true }) title: string = ''; // Título de la sección
    @Input({ required: true }) movies: MoviePreview[] = []; // Arreglo de películas

    // * ---- Estado Reactivo Local ----
    currentIndex = signal<number>(0); // Signal que guarda el índice actual de la película destacada en el carrusel
    private autoSlideInterval: any;

    // * -------- Ciclo de Vida --------
    ngOnInit(): void {
        this.startAutoSlide();
    }

    ngOnDestroy(): void {
        this.stopAutoSlide();
    }

    // * -------- Navegación del Carrusel --------
    // Avanza a la siguiente película (bucle circular)
    nextSlide(): void {
        if (this.movies.length === 0) return;
        this.currentIndex.update((i) => (i + 1) % this.movies.length);
        this.resetAutoSlide(); // Reinicia el contador de 5s tras interacción manual
    }

    // Retrocede a la película anterior (bucle circular)
    prevSlide(): void {
        if (this.movies.length === 0) return;
        this.currentIndex.update((i) => (i - 1 + this.movies.length) % this.movies.length);
        this.resetAutoSlide();
    }

    // Control del Autoplay / Timer (Públicos para pausar/reanudar en hover)
    startAutoSlide(): void {
        this.stopAutoSlide(); // Previene la duplicación de timers activos
        this.autoSlideInterval = setInterval(() => {
            if (this.movies.length === 0) return;
            this.currentIndex.update((i) => (i + 1) % this.movies.length);
        }, 5000);
    }

    stopAutoSlide(): void {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    private resetAutoSlide(): void {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    // <----- Obtiene siempre las 3 películas visibles ----->
    getVisibleMovies(): { movie: MoviePreview; position: 'left' | 'center' | 'right' }[] {
        if (this.movies.length === 0) return [];

        const total = this.movies.length;
        const curr = this.currentIndex();

        const prevIdx = (curr - 1 + total) % total;
        const nextIdx = (curr + 1) % total;

        return [
            { movie: this.movies[prevIdx], position: 'left' },
            { movie: this.movies[curr], position: 'center' },
            { movie: this.movies[nextIdx], position: 'right' },
        ];
    }

    // ? <----- Helpers / Formatters ----->
    // Retorna el contador del carrusel con formato de dos dígitos (Ej: "01/10")
    getFormattedCounter(): string {
        const total = this.movies.length;
        if (total === 0) return '00/00';

        const current = this.currentIndex() + 1;
        const formattedCurrent = current < 10 ? `0${current}` : `${current}`;
        const formattedTotal = total < 10 ? `0${total}` : `${total}`;

        return `${formattedCurrent}/${formattedTotal}`;
    }
}