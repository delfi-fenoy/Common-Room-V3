import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaylistPreview, PlaylistDetails, MoviePreview, PageResponse } from '../models';

@Injectable({
    providedIn: 'root',
})
export class PlaylistService {
    /* ! ======== API para acceder al PlaylistController ======== */
    private readonly URL = 'http://localhost:8080/playlists';

    constructor(private http: HttpClient) {}

    /* ------ Metodo para crear una nueva playlist ------ */
    createPlaylist(playlist: Partial<PlaylistDetails>): Observable<PlaylistDetails> {
        return this.http.post<PlaylistDetails>(`${this.URL}`, playlist);
    }

    /* ------ Metodo para eliminar una playlist por ID ------ */
    deletePlaylist(playlistId: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${playlistId}`);
    }

    /* ------ Metodo para modificar una playlist existente ------ */
    modifyPlaylist(playlistId: number, playlist: PlaylistDetails): Observable<PlaylistDetails> {
        return this.http.put<PlaylistDetails>(`${this.URL}/${playlistId}`, playlist);
    }

    /* ------ Metodo para agregar una pelicula a la playlist ------ */
    addMovieToPlaylist(playlistId: number, movieId: number): Observable<void> {
        return this.http.post<void>(`${this.URL}/${playlistId}/movies/${movieId}`, {});
    }

    /* ------ Metodo para eliminar una pelicula de la playlist ------ */
    deleteMovieFromPlaylist(playlistId: number, movieId: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${playlistId}/movies/${movieId}`);
    }

    /* ------ Metodo para obtener las playlists publicas de un usuario ------ */
    getUserPlaylists( username: string, page: number = 1,): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(
            `http://localhost:8080/users/${username}/playlists`,
            { params },
        );
    }

    /* ------ Metodo para obtener las playlists del usuario logueado ------ */
    getMyPlaylists(page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(
            `http://localhost:8080/users/me/playlists`,
            { params },
        );
    }

    /* ------ Metodo para obtener todas las playlists publicas ------ */
    getPublicPlaylists(page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(`${this.URL}/all`, { params });
    }

    /* ------ Metodo para buscar playlists por nombre ------ */
    searchPlaylists(query: string, page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(
            `${this.URL}/search/${encodeURIComponent(query)}`,
            { params },
        );
    }

    /* ------ Metodo para acceder a una unica playlist por ID ------ */
    getPlaylistById(playlistId: number): Observable<PlaylistDetails> {
        return this.http.get<PlaylistDetails>(`${this.URL}/${playlistId}`);
    }

    /* ------ Metodo para obtener las peliculas paginadas de una playlist ------ */
    getMovieListByPlaylistId( playlistId: number, page: number = 1,): Observable<PageResponse<MoviePreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<MoviePreview>>(`${this.URL}/${playlistId}/movies`, {
            params,
        });
    }
}
