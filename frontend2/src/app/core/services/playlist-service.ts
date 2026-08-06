import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, PlaylistRequest, PlaylistResponse } from '../models';

@Injectable({
    providedIn: 'root',
})
export class PlaylistService {
    /* ! ======== API para acceder a las playlists ======== */
    private readonly URL = 'http://localhost:8080/playlists';

    constructor(private http: HttpClient) {}

    /* ------ Metodo para crear una nueva playlist ------ */
    createPlaylist(dto: PlaylistRequest): Observable<PlaylistResponse> {
        return this.http.post<PlaylistResponse>(this.URL, dto);
    }

    /* ------ Metodo para modificar una playlist existente ------ */
    modifyPlaylist(id: number, dto: PlaylistRequest): Observable<PlaylistResponse> {
        return this.http.put<PlaylistResponse>(`${this.URL}/${id}`, dto);
    }

    /* ------ Metodo para eliminar una playlist ------ */
    deletePlaylist(id: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${id}`);
    }

    /* ------ Metodo para agregar una pelicula a la playlist ------ */
    addMovieToPlaylist(playlistId: number, movieId: number): Observable<any> {
        return this.http.post(`${this.URL}/${playlistId}/movies/${movieId}`, {});
    }

    /* ------ Metodo para eliminar una pelicula de la playlist ------ */
    deleteMovieFromPlaylist(playlistId: number, movieId: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${playlistId}/movies/${movieId}`);
    }

    /* ------ Metodo para obtener playlists de un usuario ------ */
    getUserPlaylists(username: string, page: number = 1): Observable<PageResponse<PlaylistResponse>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistResponse>>(`${this.URL}/user/${username}`, { params });
    }

    /* ------ Metodo para obtener las playlists del usuario autenticado ------ */
    getMyPlaylists(page: number = 1): Observable<PageResponse<PlaylistResponse>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistResponse>>(`${this.URL}/me`, { params });
    }

    /* ------ Metodo para obtener las playlists publicas ------ */
    getPublicPlaylists(page: number = 1): Observable<PageResponse<PlaylistResponse>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistResponse>>(`${this.URL}/public`, { params });
    }
}