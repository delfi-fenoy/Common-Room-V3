import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
    PageResponse, 
    PlaylistRequest, 
    PlaylistResponse, 
    PlaylistPreview, 
    MovieBase 
} from '../models';

@Injectable({
    providedIn: 'root',
})
export class PlaylistService {
    private readonly URL = 'http://localhost:8080/playlists';
    private readonly USERS_URL = 'http://localhost:8080/users';

    constructor(private http: HttpClient) {}

    // <----- Crear nueva playlist ----->
    createPlaylist(dto: PlaylistRequest): Observable<PlaylistResponse> {
        return this.http.post<PlaylistResponse>(this.URL, dto);
    }

    // <----- Modificar playlist existente ----->
    modifyPlaylist(id: number, dto: PlaylistRequest): Observable<PlaylistResponse> {
        return this.http.put<PlaylistResponse>(`${this.URL}/${id}`, dto);
    }

    // <----- Eliminar playlist por ID ----->
    deletePlaylist(id: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${id}`);
    }

    // <----- Obtener detalle completo de una playlist (incluye descripción) ----->
    getPlaylistById(id: number): Observable<PlaylistResponse> {
        return this.http.get<PlaylistResponse>(`${this.URL}/${id}`);
    }

    // <----- Obtener listado de películas pertenecientes a una playlist ----->
    getMovieListByPlaylistId(playlistId: number, page: number = 1): Observable<PageResponse<MovieBase>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<MovieBase>>(`${this.URL}/${playlistId}/movies`, { params });
    }

    // <----- Agregar una película a la playlist ----->
    addMovieToPlaylist(playlistId: number, movieId: number): Observable<any> {
        return this.http.post(`${this.URL}/${playlistId}/movies/${movieId}`, {});
    }

    // <----- Eliminar una película de la playlist ----->
    deleteMovieFromPlaylist(playlistId: number, movieId: number): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${playlistId}/movies/${movieId}`);
    }

    // <----- Obtener playlists públicas de un usuario específico ----->
    getUserPlaylists(username: string, page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(`${this.USERS_URL}/${username}/playlists`, { params });
    }

    // <----- Obtener las playlists del usuario autenticado ----->
    getMyPlaylists(page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(`${this.USERS_URL}/me/playlists`, { params });
    }

    // <----- Obtener playlists públicas generales ----->
    getPublicPlaylists(page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(`${this.URL}/all`, { params });
    }

    // <----- Buscar playlists públicas por nombre ----->
    searchPlaylists(query: string, page: number = 1): Observable<PageResponse<PlaylistPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<PlaylistPreview>>(`${this.URL}/search/${query}`, { params });
    }
}