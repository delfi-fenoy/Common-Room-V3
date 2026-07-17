import { Component, OnDestroy, OnInit } from '@angular/core';
import MovieBase from '../../models/MovieBase';
import { MovieService } from '../../services/movie-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})

export class HomePage implements OnInit, OnDestroy{

  // * ---- Array de peliculas a mostrar ----
  recentMovies : MovieBase[] = [];
  popularMovies : MovieBase[] = [];
  upcomingMovies : MovieBase[] = [];

  // ? ---- Estado de los carouseles ----
  indices = {
    recent: 0,
    popular: 0,
    upcoming: 0
  };

  autoSlides: { [key: string]: any } = {};

  // * ====== Contructor | ngOnInit ======
  constructor(private mService : MovieService) {}

  ngOnInit(): void {
    this.loadAllMovies();
  }

  ngOnDestroy(): void {
    Object.values(this.autoSlides).forEach(interval => clearInterval(interval));
  }

  // * -------- Metodo para reemplazar posters sin imagen -------- 
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-poster.jpg';
  }

  // ! ====== Metodo para cargar todo ======
  loadAllMovies() : void{
    // ? ----- Recent Movies -----
    this.mService.getRecentMovies(1).subscribe({
      next : (data) => {
        this.recentMovies = data
        this.startAutoSlide('recent');
      },
      error : (e) => console.error(e)
    })

    // ? ----- Popular Movies -----
    this.mService.getPopularMovies(1).subscribe({
      next : (data) => {
        this.popularMovies = data
        this.startAutoSlide('popular');
      },
      error : (e) => console.error(e)
    })
    
    // ? ----- Upcoming Movies -----
    this.mService.getUpcomingMovies(1).subscribe({
      next: (data) => {
        this.upcomingMovies = data;
        this.startAutoSlide('upcoming');
      },
      error : (e) => console.error(e)
    })
  }

  // ! ====== Devuelve las películas visibles de un carrusel ======
  getVisibleMovies(type: 'recent' | 'popular' | 'upcoming'): MovieBase[] {
    const allMovies = (this as any)[`${type}Movies`] as MovieBase[];
    const start = this.indices[type];
    const result: MovieBase[] = [];

    if (!allMovies || !allMovies.length) return result;

    for (let i = 0; i < 4; i++) {
      const idx = (start + i) % allMovies.length;
      result.push(allMovies[idx]);
    }

    return result;
  }

  // * -------- Movimiento de los Caruseles -------- 
  // ? ----- Next Movie -----
  nextSlide(type: 'recent' | 'popular' | 'upcoming'): void {
    const arr = (this as any)[`${type}Movies`] as MovieBase[];
    if (!arr?.length) return;
    this.indices[type] = (this.indices[type] + 1) % arr.length;
  }

  // ? ----- Prev Movie -----
  prevSlide(type: 'recent' | 'popular' | 'upcoming'): void {
    const arr = (this as any)[`${type}Movies`] as MovieBase[];
    if (!arr?.length) return;
    this.indices[type] = (this.indices[type] - 1 + arr.length) % arr.length;
  }

  // ? ----- Movimiento automatico -----
  startAutoSlide(type: 'recent' | 'popular' | 'upcoming'): void {
    if (this.autoSlides[type]) return;
    const arr = (this as any)[`${type}Movies`] as MovieBase[];
    if (!arr?.length) return;
    this.autoSlides[type] = setInterval(() => this.nextSlide(type), 4000);
  }

}
