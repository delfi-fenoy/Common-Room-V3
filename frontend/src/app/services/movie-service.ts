import { HttpClient, HttpParams } from '@angular/common/http';
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
  // Agregamos los parámetros genero y año opcionales
  getAllMovies(page : number = 1, genre?:string, year?:string) {

    let params = new HttpParams().set('page', page)

    // Si hay género entonces lo agrego al parámetro
    if(genre)
    {
      params = params.set('genre',genre)
    }

    // Si hay año entonces lo agrego al parámetro
    if(year)
    {
      params = params.set('year', year)
    }

    return this.http.get<MovieBase[]>(`${this.API_URL}/all`, {params: params})
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

  //Metodo para buscar peliculas (con filtros)
  searchMovies(query: string, page: number = 1, genre?: string, year?: string) {

    let params = new HttpParams().set('page', page)

    if(genre)
    {
      params = params.set('genre', genre)
    }

    if(year)
    {
      params = params.set('year', year)
    }

    return this.http.get<MovieBase[]>(`${this.API_URL}/search/${query}`, {params:params})
  }
}
