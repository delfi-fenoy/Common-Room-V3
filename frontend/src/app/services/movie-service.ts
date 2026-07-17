import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import MovieBase from '../models/MovieBase';
import { MovieDetails } from '../models/MovieDetails';

@Injectable({
  providedIn: 'root'
})

export class MovieService {
  /* ! ======== API para acceder al MovieController ======== */
  private readonly API_URL = 'http://localhost:8080/movies';

  constructor(private http: HttpClient) { }

  /* ------ Metodo para acceder a una unica pelicula por ID  ------ */
  getMovieById(id : number){
    return this.http.get<MovieDetails>(`${this.API_URL}/${id}`)
  }

  /* ------ Metodo para acceder a todas las peliculas ------ */
  getAllMovies(page : number = 1) {
    return this.http.get<MovieBase[]>(`${this.API_URL}/all?page=${page}`)
  }

  /* ------ Metodo para acceder a las peliculas populares ------ */
  getPopularMovies(page : number = 1) {
    return this.http.get<MovieBase[]>(`${this.API_URL}/popular?page=${page}`)
  }

  /* ------ Metodo para acceder a las peliculas recientes ------ */
  getRecentMovies(page : number = 1) {
    return this.http.get<MovieBase[]>(`${this.API_URL}/recent?page=${page}`)
  }

  /* ------ Metodo para acceder a las peliculas proximas por salir ------ */
  getUpcomingMovies(page : number = 1) {
    return this.http.get<MovieBase[]>(`${this.API_URL}/upcoming?page=${page}`)
  }

  //Metodo para buscar peliculas
  searchMovies(query: string, page: number = 1) {
    return this.http.get<MovieBase[]>(`${this.API_URL}/search/${query}?page=${page}`)
  }
}
