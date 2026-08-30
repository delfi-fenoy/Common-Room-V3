import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MoviePreview, MovieDetails } from '../models';

@Injectable({
    providedIn: 'root',
})
export class MovieService {
    /* ! ======== API para acceder al MovieController ======== */
    private readonly URL = 'http://localhost:8080/movies';

    constructor(private http: HttpClient) {}

    /* ------ Metodo para acceder a una unica pelicula por ID ------ */
    getMovieById(id: number): Observable<MovieDetails> {
        return this.http.get<MovieDetails>(`${this.URL}/${id}`);
    }

    /* ------ Metodo para acceder a todas las peliculas ------ */
    getAllMovies(page: number = 1): Observable<MoviePreview[]> {
        return this.http.get<MoviePreview[]>(`${this.URL}/all?page=${page}`);
    }

    /* ------ Metodo para acceder a las peliculas populares ------ */
    getPopularMovies(page: number = 1): Observable<MoviePreview[]> {
        return this.http.get<MoviePreview[]>(`${this.URL}/popular?page=${page}`);
    }

    /* ------ Metodo para acceder a las peliculas recientes ------ */
    getRecentMovies(page: number = 1): Observable<MoviePreview[]> {
        return this.http.get<MoviePreview[]>(`${this.URL}/recent?page=${page}`);
    }

    /* ------ Metodo para acceder a las peliculas proximas por salir ------ */
    getUpcomingMovies(page: number = 1): Observable<MoviePreview[]> {
        return this.http.get<MoviePreview[]>(`${this.URL}/upcoming?page=${page}`);
    }

    /* ------ Metodo para buscar y filtrar peliculas por criterios ------ */
    searchOrDiscoverMovies(
        page: number = 1,
        query?: string,
        year?: string,
        genreId?: number,
    ): Observable<MoviePreview[]> {
        let params = new HttpParams().set('page', page.toString());

        if (query && query.trim() !== '') {
            params = params.set('query', query.trim());
        }
        if (year && year.trim() !== '') {
            params = params.set('year', year.trim());
        }

        // <----- Validación extra para evitar NaN ----->
        if (genreId !== undefined && genreId !== null && !isNaN(genreId)) {
            params = params.set('genre', genreId.toString());
        }

        return this.http.get<MoviePreview[]>(`${this.URL}/search-or-discover`, { params });
    }
}