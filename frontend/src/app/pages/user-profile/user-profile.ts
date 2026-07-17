import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { User } from '../../models/User';
import { ReviewService } from '../../services/review-service';
import { Review } from '../../models/Review';
import { ReviewModal } from "../../components/review-modal/review-modal";
import { AuthService } from '../../services/auth-service';
import { ModifyUserModal } from '../../components/modify-user-modal/modify-user-modal';
import { Subscription } from 'rxjs';
import { ChangePasswordModal } from '../../components/change-password-modal/change-password-modal';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink, ReviewModal, ModifyUserModal, ChangePasswordModal],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit{
  // * ======== Variables ========
  selectedUser: User | null = null
  currentUsername: string | null = null
  reviews: Review[] = []
  isMyProfile = false
  isAdmin = false
  modalState = signal<"editReview"| "editProfile" | "changePassword" | null>(null) // Variable reactiva (cuando cambia su valor, Angular actualiza automáticamente la vista)
  selectedReview: Review | null = null
  private routeSubscription !: Subscription

  // * ======== Contructor | ngOnInit ========
  constructor(private route: ActivatedRoute, 
    private router : Router,
    public uService: UserService,
    private rService: ReviewService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.currentUsername = this.auth.getUsername()
      console.log("Nombre actual en el Token : " + this.currentUsername)
      const user = params['username'];
      if (user) {
        this.loadUser(user)
        this.loadReviews(user)
        if(this.currentUsername === user){
          this.isMyProfile = true;
        }
        this.isAdmin = (this.auth.getUserRole() === 'ADMIN')
      }
    })
  }

  // ! ====== Metodo para cargar los datos del Usuario ======
  // ? ----- Cargar Usuario -----
  loadUser(username: string){
    this.uService.getUserProfile(username).subscribe({
      next: (data) => {this.selectedUser = data},
      error: (e) => console.error(e)
    })
  }

  // ? ----- Cargar sus Reviews -----
  loadReviews(username: string){
    this.rService.getReviewsForUser(username).subscribe({
      next: (data) => {this.reviews = data},
      error: (e) => console.error(e)
    })
  }

  // ! -------- Metodo para borrar una Review --------
  onDeleteReview(reviewId: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.rService.deleteReview(reviewId).subscribe({
        next: () => {
          alert('Review deleted successfully.')
          this.loadReviews(this.selectedUser!.username);
        },
        error: (e) => {
          console.error(e)
          alert('Error deleting review.')
        }
      })
    }
  }

  // ! -------- Metodo para eliminar usuario --------
  deleteUser(){
    if(confirm('Are you sure you want to delete your profile? It is permanent')){
      this.uService.deleteUser(this.selectedUser!.username).subscribe({
      next: () => {
        alert('User deleted successfully!')
        this.auth.logout()
      },
      error: (e) => console.error(e)
    })
    }
  }

  // ! ====== Metodos para los modales ======
  openEditReviewModal(review: Review){
    this.selectedReview = review
    this.modalState.set("editReview")
  }

  openEditProfileModal(){
    this.modalState.set("editProfile")
  }

  openChangePasswordModal(){
    this.modalState.set("changePassword")
  }

  closeModal(){
    this.modalState.set(null)
  }
  
  // ? ----- Para reiniciar la pagina cuando se agregue o edite -----
  refreshReviews() {
    this.loadReviews(this.selectedUser!.username);
  }

  refreshUser() {
    this.loadUser(this.currentUsername!);
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
}