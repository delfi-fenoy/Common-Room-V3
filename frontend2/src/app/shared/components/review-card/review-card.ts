import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Review } from '../../../core/models';

@Component({
    selector: 'app-review-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './review-card.html',
    styleUrl: './review-card.css',
})
export class ReviewCard {
    // * ======== Inputs ========
    @Input({ required: true }) review!: Review;

    // ? ----- Modos de Visualización -----
    // 'movie' -> Usado en MovieSheet (Muestra datos del usuario)
    // 'user'  -> Usado en UserProfile (Muestra póster de la película)
    @Input() mode: 'movie' | 'user' = 'movie';

    // ? ----- Permisos y Estado -----
    @Input() currentUsername: string | null = null;
    @Input() isAdmin: boolean = false;
    @Input() isMyProfile: boolean = false;
    @Input() isHighlighted: boolean = false; // <----- Resalta la reseña del usuario en la vista ----->

    // * ======== Outputs ========
    @Output() edit = new EventEmitter<Review>();
    @Output() delete = new EventEmitter<number>();

    // ! -------- Métodos de Acción --------
    onEdit(): void {
        this.edit.emit(this.review);
    }

    onDelete(): void {
        this.delete.emit(this.review.id);
    }

    // * -------- Métodos para Reemplazar Imágenes Fallidas --------
    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-poster.jpg';
    }

    noProfilePicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/userv2.jpg';
    }
}