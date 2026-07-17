import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import MovieBase from '../../models/MovieBase';
import { MovieService } from '../../services/movie-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-page',
  imports: [RouterLink],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css'
})
export class SearchPage implements OnInit, OnDestroy{
  
  // * ======== Variables ========
  movies: MovieBase[] = []
  currentPage: number = 1
  public hasMorePages: boolean = false
  private routeSubscription !: Subscription

  // * ======== Contructor | ngOnInit | ngOnDestroy ========
  constructor(
    public mService: MovieService,
    private actRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en los parametros de la ruta
    this.routeSubscription = this.actRoute.params.subscribe(params => {
      const searchQuery = params['query'];
      
      // Llamamos a loadMovies CADA VEZ que los params cambien
      if (searchQuery) {
        this.currentPage = 1
        this.movies = []
        this.loadMovies(searchQuery)
      }
    })
  }

  // Desuscribirse cuando el componente se destruye
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  // ! -------- Metodo para cargar peliculas -------- 
  loadMovies(query: string) {
    this.mService.searchMovies(query, this.currentPage).subscribe({
      next: (data) => {
        this.movies = data
        this.hasMorePages = data.length === 20
      },
      error: (e) => {
        console.error('Error al cargar las películas:', e)
      }
    })
  }

  // ! ====== Metodos para la Paginacion ======
  // ? ----- Next Page -----
  nextPage(): void {
    this.currentPage++
    this.loadMovies(this.actRoute.snapshot.params['query'])
    this.scrollToTop()
  }

  // ? ----- Previous Page -----
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.loadMovies(this.actRoute.snapshot.params['query'])
      this.scrollToTop()
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
