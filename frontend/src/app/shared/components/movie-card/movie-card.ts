import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoviePreview } from '../../../core/models';

@Component({
    selector: 'app-movie-card',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './movie-card.html',
    styleUrl: './movie-card.css',
})
export class MovieCard {
    /* * ---- Propiedad requerida recibida del componente padre ---- */
    @Input({ required: true }) movie!: MoviePreview;

    /* * -------- Método para reemplazar posters sin imagen -------- */
    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/movie-noimg.jpg';
    }
}