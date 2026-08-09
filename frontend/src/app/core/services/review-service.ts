import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review, PageResponse } from '../models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReviewService {
    /* ! ======== API para acceder al ReviewController ======== */
    private readonly URL = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    /* ------ Metodo para obtener todas las reseñas de una pelicula ------ */
    getReviewsForMovie(movieId: number, page: number = 1): Observable<PageResponse<Review>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<Review>>(`${this.URL}/movies/${movieId}/reviews`, { params });
    }

    /* ------ Metodo para obtener todas las reseñas de un usuario ------ */
    getReviewsForUser(username: string, page: number = 1): Observable<PageResponse<Review>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<Review>>(`${this.URL}/users/${username}/reviews`, { params });
    }

    /* ------ Metodo para obtener la reseña de un usuario para una pelicula especifica ------ */
    getUserReviewForMovie(username: string, movieId: number): Observable<Review> {
        return this.http.get<Review>(`${this.URL}/users/${username}/reviews/${movieId}`);
    }

    /* ------ Metodo para crear una nueva reseña ------ */
    createReview(review: Review): Observable<Review> {
        return this.http.post<Review>(`${this.URL}/reviews`, review);
    }

    /* ------ Metodo para actualizar una reseña existente ------ */
    updateReview(review: Review): Observable<Review> {
        return this.http.put<Review>(`${this.URL}/reviews/${review.id}`, review);
    }

    /* ------ Metodo para eliminar una reseña por ID ------ */
    deleteReview(reviewId: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/reviews/${reviewId}`);
    }
}