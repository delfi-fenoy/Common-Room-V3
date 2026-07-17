import { Component, OnInit } from '@angular/core';
import MovieBase from '../../models/MovieBase';
import { MovieService } from '../../services/movie-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movies-list',
  imports: [RouterLink],
  templateUrl: './movies-list.html',
  styleUrl: './movies-list.css',
})
export class MoviesList implements OnInit {

  // * ======== Variables ========
  movies: MovieBase[] = [];
  currentPage = 1;
  public hasMorePages: boolean = false;

  // * ======== Contructor | ngOnInit ========
  constructor(public mService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  // ! -------- Metodo para cargar peliculas -------- 
  loadMovies(): void {
    this.mService.getAllMovies(this.currentPage).subscribe({
      next: (data) => {
        (this.movies = data), (this.hasMorePages = data.length === 20);
      },
      error: (e) => console.error(e),
    });
  }

  // ! ====== Metodos para la Paginacion ======
  // ? ----- Next Page -----
  nextPage(): void {
    this.currentPage++;
    this.loadMovies();
    this.scrollToTop();
  }

  // ? ----- Previous Page -----
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMovies();
      this.scrollToTop();
    }
  }

  // ? ----- Metodo para volver hacia arriba -----
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // * -------- Metodo para reemplazar posters sin imagen --------
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-poster.jpg';
  }
}
