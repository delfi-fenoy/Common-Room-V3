import { Component, OnInit } from '@angular/core';
import UserPreview from '../../models/UserPreview';
import { UserService } from '../../services/user-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users-list',
  imports: [RouterLink],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList implements OnInit{
  // * ======== Variables ========
  public allUsers: UserPreview[] = []
  public pagedUsers: UserPreview[] = []
  currentPage = 1
  itemsPerPage = 12

  // * ======== Contructor | ngOnInit ========
  constructor(public uService: UserService){}

  ngOnInit(): void {
    this.loadUsers()
  }

  // ! -------- Metodo para cargar Usuarios -------- 
  loadUsers(): void{
    this.uService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data
        this.updatePage()
      },
      error: (e) => console.error(e)
    })
  }

  // ! ====== Metodos para la Paginacion ======
  // ? ----- Next Page -----
  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++
      this.scrollToTop()
      this.updatePage()
    }
  }

  // ? ----- Previous Page -----
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.scrollToTop()
      this.updatePage()
    }
  }
  
  // ? ----- Update Page -----
  updatePage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    this.pagedUsers = this.allUsers.slice(startIndex, endIndex)
  }

  // ? ----- Total Page -----
  totalPages(): number {
    if (this.allUsers.length === 0) {
      return 1
    }
    return Math.ceil(this.allUsers.length / this.itemsPerPage)
  }

  // ? ----- Metodo para volver hacia arriba -----
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // * -------- Metodo para reemplazar posters sin imagen --------
  noProfilePicture(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/user.png';
  }
}
