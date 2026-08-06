import { Component, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    ValidationErrors,
} from '@angular/forms';

import { Modal } from '../modal/modal';
import { ModalService } from '../../services/modal-services';
import { MovieDetails, Review } from '../../../core/models';
import { ReviewService } from '../../../core/services/review-service';

@Component({
    selector: 'app-review-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Modal],
    templateUrl: './review-form-modal.html',
    styleUrl: './review-form-modal.css',
})
export class ReviewFormModal implements OnInit {
    // * ======== Inyección de Servicios ========
    public modalService = inject(ModalService);
    private fb = inject(FormBuilder);
    private reviewService = inject(ReviewService);

    // * ======== Inputs y Outputs ========
    movie = input<MovieDetails | null>(null);
    review = input<Review | null>(null);
    submitted = output<void>();

    // * ======== Variables de Estado del Formulario ========
    reviewForm!: FormGroup;
    displayedRating: number = 5;
    finalRating: number = 5;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        const initialRating = this.review()?.rating ?? 5;
        this.finalRating = initialRating;
        this.displayedRating = initialRating;

        // <----- Configuración de campos y validaciones ----->
        this.reviewForm = this.fb.group({
            rating: [
                initialRating,
                [Validators.required, Validators.min(0.5), Validators.max(5), this.multipleOfHalf],
            ],
            comment: [this.review()?.comment ?? '', [Validators.maxLength(700)]],
            movieId: [this.movie()?.id ?? this.review()?.movieId ?? null],
        });
    }

    // ? ----- Validador Personalizado de Rating (Pasos de 0.5) -----
    multipleOfHalf(control: AbstractControl): ValidationErrors | null {
        if (control.value === null || control.value === undefined) return null;
        const value = Number(control.value);
        return value % 0.5 === 0 ? null : { notMultipleOfHalf: true };
    }

    // ! -------- Selección e Interacción de Estrellas --------
    selectRating(event: MouseEvent, index: number): void {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;

        // <----- Determina si el clic fue en la mitad izquierda (0.5) o derecha (1.0) ----->
        this.finalRating = x < rect.width / 2 ? index - 0.5 : index;
        this.displayedRating = this.finalRating;

        this.reviewForm.get('rating')?.setValue(this.finalRating);
        this.reviewForm.get('rating')?.markAsTouched();
        this.reviewForm.get('rating')?.updateValueAndValidity();
    }

    hoverRating(event: MouseEvent, index: number): void {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;

        this.displayedRating = x < rect.width / 2 ? index - 0.5 : index;
    }

    clearHover(): void {
        this.displayedRating = this.finalRating;
    }

    // ! -------- Envío del Formulario (Crear / Editar) --------
    onSubmit(): void {
        if (this.reviewForm.invalid) return;

        const currentReview = this.review();
        if (!currentReview?.id) {
            this.addReview();
        } else {
            this.editReview(currentReview.id);
        }
    }

    private addReview(): void {
        this.reviewService.createReview(this.reviewForm.value).subscribe({
            next: () => {
                this.modalService.close();
                this.submitted.emit();
                this.modalService.openAlert('Review Saved', 'Your review has been successfully submitted.', 'success');
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not save the review.', 'error');
            },
        });
    }

    private editReview(reviewId: number): void {
        const updatedReview = {
            ...this.reviewForm.value,
            id: reviewId,
        };

        this.reviewService.updateReview(updatedReview).subscribe({
            next: () => {
                this.modalService.close();
                this.submitted.emit();
                this.modalService.openAlert('Review Updated', 'Changes were saved successfully.', 'success');
            },
            error: (e) => {
                console.error(e);
                this.modalService.openAlert('Error', 'Could not update the review.', 'error');
            },
        });
    }

    // ? ----- Cancelar y Cerrar Modal -----
    onCancel(): void {
        this.modalService.close();
    }

    // * -------- Método para reemplazar imagen de póster fallida --------
    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/movie-noimg.jpg';
    }
}