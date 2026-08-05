import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieBase } from '../../../core/models';

@Component({
    selector: 'app-movie-carousel',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './movie-carousel.html',
    styleUrl: './movie-carousel.css',
})
export class MovieCarouselComponent implements OnInit, OnDestroy {
    // * ---- Inputs recibidos del componente padre ----
    @Input({ required: true }) title: string = ''; // Título de la sección
    @Input({ required: true }) movies: MovieBase[] = []; // Arreglo de películas

    // * ---- Estado Reactivo Local ----
    currentIndex = signal<number>(0); // Signal que guarda el índice actual de la película destacada en el carrusel
    private autoSlideInterval: any;

    // * -------- Ciclo de Vida --------
    ngOnInit(): void {
        this.startAutoSlide();
    }

    ngOnDestroy(): void {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }
    }

    // * -------- Navegación del Carrusel --------
    // Avanza a la siguiente película; si llega al final, reinicia al primer elemento (0)
    nextSlide(): void {
        if (this.movies.length === 0) return;
        const next = (this.currentIndex() + 1) % this.movies.length;
        this.currentIndex.set(next);
    }

    // Retrocede a la película anterior; si está en la primera, salta a la última
    prevSlide(): void {
        if (this.movies.length === 0) return;
        const prev = (this.currentIndex() - 1 + this.movies.length) % this.movies.length;
        this.currentIndex.set(prev);
    }

    // Inicia un intervalo de 5 segundos que ejecuta `nextSlide()` automáticamente
    private startAutoSlide(): void {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
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

    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/movie-noimg.jpg';
    }
}