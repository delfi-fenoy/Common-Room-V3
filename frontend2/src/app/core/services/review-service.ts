import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReviewService {
  /* ! ======== API para acceder a las reseñas ======== */
  private readonly URL = 'http://localhost:8080';

  constructor(private http: HttpClient){}

  /* ------ Metodo para crear una nueva reseña ------ */
  createReview(review: Review): Observable<Review>{
    return this.http.post<Review>(`${this.URL}/reviews`, review);
  }
  
  /* ------ Metodo para actualizar una reseña existente ------ */
  updateReview(review: Review): Observable<Review>{
    return this.http.put<Review>(`${this.URL}/reviews/${review.id}`, review);
  }
  
  /* ------ Metodo para eliminar una reseña por ID ------ */
  deleteReview(reviewId: number): Observable<void>{
    return this.http.delete<void>(`${this.URL}/reviews/${reviewId}`);
  }
  
  /* ------ Metodo para obtener todas las reseñas de una pelicula ------ */
  getReviewsForMovie(movieId: number): Observable<Review[]>{
    return this.http.get<Review[]>(`${this.URL}/movies/${movieId}/reviews`);
  }

  /* ------ Metodo para obtener todas las reseñas de un usuario ------ */
  getReviewsForUser(username: string): Observable<Review[]>{
    return this.http.get<Review[]>(`${this.URL}/users/${username}/reviews`);
  }

  /* ------ Metodo para obtener la reseña de un usuario para una pelicula especifica ------ */
  getUserReviewForMovie(username: string, movieId: number): Observable<Review>{
    return this.http.get<Review>(`${this.URL}/users/${username}/reviews/${movieId}`);
  }
}