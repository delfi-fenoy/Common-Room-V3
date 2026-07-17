import { Component, input, OnInit, output } from '@angular/core';
import { MovieDetails } from '../../models/MovieDetails';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Review } from '../../models/Review';
import { ReviewService } from '../../services/review-service';

@Component({
  selector: 'app-review-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './review-modal.html',
  styleUrl: './review-modal.css',
})
export class ReviewModal implements OnInit {
  // * ======== Variables ========
  movie = input<MovieDetails>();
  review = input<Review>();
  close = output<void>();
  reviewForm!: FormGroup;
  submitted = output<void>();

  // - Rating Stars System
  displayedRating: number = 0; // Lo que se ve
  finalRating: number = 0;     // Lo que el usuario elige

  // * ======== Contructor | ngOnInit ========
  constructor(
    private fb: FormBuilder, 
    private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [
        this.review()?.rating ?? null, // Nullish Coalescing - Si lo de la izquierda es null o undefined, usá lo de la derecha.
        [Validators.required, Validators.min(0.5), Validators.max(5), this.multipleOfHalf],
      ],
      comment: [this.review()?.comment ?? null, [Validators.maxLength(700)]],
      movieId: this.movie()?.id
    });

    // Cargar rating si edita reseña
    if (this.review()) {
      this.finalRating = this.review()!.rating;
      this.displayedRating = this.finalRating;
    }
  }

  // ! -------- Validador Rating | Solo multiplo de 0.5 -------- 
  multipleOfHalf(control: AbstractControl): ValidationErrors | null {
    const value = Number(control.value); //Convertir el valor recibido a número (por seguridad)
    // Si el nro no es múltiplo de 0.5, retornamos un objeto con la clave del error
    return value % 0.5 === 0 ? null : { notMultipleOfHalf: true };
  }

  // ! ====== Metodo de Subir Reseña (Add o Edit) ======
  onSubmit() {
    if(!this.review()){ // SI no existe la review, es para crear
      this.addReview()
    } else{
      this.editReview()
    }
  }

  // ? ----- Nueva Reseña -----
  addReview(){
    this.reviewService.createReview(this.reviewForm.value).subscribe({
      next: (data) => {
        alert('Review saved successfully!');
        this.submitted.emit(); // <--- AVISA
        this.closeModal();
      },
      error: (e) => console.error(e),
    });
  }

  // ? ----- Editar una Reseña -----
  editReview(){
    // Creamos el objeto de la Review con los datos del Form y el ID
    const updatedReview = {
        ...this.reviewForm.value,
        id: this.review()?.id
      };
    
    this.reviewService.updateReview(updatedReview).subscribe({
      next: (data) => {
        alert('Review updated successfully!');
        this.submitted.emit(); // <--- AVISA
        this.closeModal();
      },
      error: (e) => console.error(e),
    });
  }

  // ! ====== Metodos para las Estrellas ======
  // ? ----- CLICK: el usuario elige el rating -----
  selectRating(event: MouseEvent, index: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;

    this.finalRating = x < rect.width / 2 ? index - 0.5 : index;
    this.displayedRating = this.finalRating;

    this.reviewForm.get('rating')?.setValue(this.finalRating);
    this.reviewForm.get('rating')?.markAsTouched();
    this.reviewForm.get('rating')?.updateValueAndValidity();
  }

  // ? ----- HOVER: efecto visual -----
  hoverRating(event: MouseEvent, index: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;

    this.displayedRating = x < rect.width / 2 ? index - 0.5 : index;
  }

  // ? ----- CLEAR: vuelve al estado del click -----
  clearHover() {
    this.displayedRating = this.finalRating;
  }

  // * -------- Metodo para cerrar el modal --------
  closeModal() {
    const modal = document.querySelector('.full-modal');

    if (modal) {
      modal.classList.add('closing');

      setTimeout(() => {
        this.close.emit();
      }, 300);
    } else {
      this.close.emit();
    }
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-poster.jpg';
  }

}
