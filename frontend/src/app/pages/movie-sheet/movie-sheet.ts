import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { MovieDetails } from '../../models/MovieDetails';
import { Review } from '../../models/Review';
import { ReviewModal } from "../../components/review-modal/review-modal";
import { ReviewService } from '../../services/review-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-movie-sheet',
  imports: [ReviewModal, RouterLink],
  templateUrl: './movie-sheet.html',
  styleUrl: './movie-sheet.css'
})

export class MovieSheet implements OnInit{
  // * ======== Variables ========
  chosenMovie!: MovieDetails
  reviews : Review[] = []
  modalState = signal<"create" | "edit" | null>(null) // Variable reactiva (cuando cambia su valor, Angular actualiza automáticamente la vista)
  selectedReview: Review | null = null

  isLoggedIn = false
  isAdmin: boolean = false // El current user es admin?
  currentUsername: string | null = null
  currentUserReview: Review | null = null

  // * ======== Contructor | ngOnInit ========
  constructor(private route: ActivatedRoute,
    private mService: MovieService,
    private rService: ReviewService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Conseguimos el ID de la pelicula desde la URL
    const movieId = this.route.snapshot.params['id']

    this.isLoggedIn = this.auth.isLoggedIn()
    this.currentUsername = this.auth.getUsername()
    this.isAdmin = (this.auth.getUserRole() === 'ADMIN')
    if(this.currentUsername){
      this.getCurrentUserReview(this.currentUsername, movieId)
    }

    // Cargamos la pelicula y sus reviews
    this.loadMovie(movieId)
    this.loadReviews(movieId)
  }

  // ! -------- Metodo para cargar la pelicula -------- 
  loadMovie(id: number){
    this.mService.getMovieById(id).subscribe({
      next: (data) => { this.chosenMovie = data },
      error: (e) => { console.error(e) }
    })
  }

  // ! -------- Metodo para cargar las reviews --------
  // ? ----- Cargar Reseñas -----
  loadReviews(movieId: number){
    this.rService.getReviewsForMovie(movieId).subscribe({
      next: (data) => {this.reviews = data},
      error: (e) => console.error(e)
    })
  }

  // ! -------- Metodo para borrar reviews --------
  onDeleteReview(reviewId : number){
    if(confirm('Are your sure you want to delete this review?')){
      this.rService.deleteReview(reviewId).subscribe({
        next: () => {
          alert('Review deleted succesfully.')
          this.refreshReviews()
        },
        error: (e) => {
          console.error(e)
          alert('Error deleting review. You might not be the owner.')
        }
      })
    }
  }

  // ! ====== Metodos para el Model ======
  openCreateModal(){
    this.selectedReview = null
    this.modalState.set("create")
  }

  openEditModal(review: Review){
    this.selectedReview = review
    this.modalState.set("edit")
  }

  closeModal(){
    this.modalState.set(null)
  }

  // ? ----- Para reiniciar la pagina cuando se agregue o edite -----
  refreshReviews() {
    this.loadReviews(this.chosenMovie.id);
      this.getCurrentUserReview(this.currentUsername!, this.chosenMovie.id) // esta funcion se llama ANTES de verificar que haya un user logueado
  }

  // * -------- Metodo para reemplazar posters sin imagen --------
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-poster.jpg';
  }

  // * -------- Metodo para reemplazar posters sin imagen --------
  noProfilePicture(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/user.png';
  }

  getCurrentUserReview(username: string, movieId: number){
    this.rService.getUserReviewForMovie(username, movieId).subscribe({
      next: (data) => {
        this.currentUserReview = data
      },
      error: (e) => console.error(e)
    })
  }
}
