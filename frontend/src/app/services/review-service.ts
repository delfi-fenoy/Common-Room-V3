import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review } from '../models/Review';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private URL = 'http://localhost:8080'

  constructor(private http: HttpClient){}

  //POST reviews
  createReview(review: Review):  Observable<Review>{
    return this.http.post<Review>(`${this.URL}/reviews`, review)
  }
  
  //PUT review
  updateReview(review: Review): Observable<Review>{
    return this.http.put<Review>(`${this.URL}/reviews/${review.id}`, review)
  }
  
  //DELETE review
  deleteReview(reviewId: number): Observable<void>{
    return this.http.delete<void>(`${this.URL}/reviews/${reviewId}`)
  }
  
  //GET reviews por película (paginado)
  getReviewsForMovie(movieId: number, page: number = 1): Observable<any>{
    let params = new HttpParams().set('page', page);
    return this.http.get<any>(`${this.URL}/movies/${movieId}/reviews`, {params:params});
  }

  //GET reviews por usuario (paginado)
  getReviewsForUser(username: string, page: number = 1): Observable<any>{
    let params = new HttpParams().set('page', page);
    return this.http.get<any>(`${this.URL}/users/${username}/reviews`, {params:params});
  }

  getUserReviewForMovie(username: string, movieId: number): Observable<Review>{
    return this.http.get<Review>(`${this.URL}/users/${username}/reviews/${movieId}`)
  }
}
