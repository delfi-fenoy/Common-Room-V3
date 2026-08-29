import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, TokenResponse, ChangePassword, UserPreview, PageResponse } from '../models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    /* ! ======== API para acceder al UserController ======== */
    private readonly URL = 'http://localhost:8080/users';

    constructor(private http: HttpClient) {}

    /* ------ Metodo para obtener la lista paginada de usuarios ------ */
    getUsers(page: number = 1, size: number = 10, role?: string): Observable<PageResponse<UserPreview>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (role && role !== 'all') {
            params = params.set('role', role);
        }

        return this.http.get<PageResponse<UserPreview>>(`${this.URL}/all`, { params });
    }

    /* ------ Metodo para buscar usuarios paginados ------ */
    searchUsers(query: string, role?: string, page: number = 1): Observable<PageResponse<UserPreview>> {
        let params = new HttpParams().set('page', page.toString()); // Query se pasa en el Path Variable, no en HttpParams
        
        if (role && role !== 'all') {
            params = params.set('role', role);
        }

        // Se ajusta la ruta a /users/search/{query}
        return this.http.get<PageResponse<UserPreview>>(`${this.URL}/search/${encodeURIComponent(query)}`, { params });
    }

    /* ------ Metodo para acceder al perfil publico de un usuario ------ */
    getUserProfile(username: string): Observable<User> {
        return this.http.get<User>(`${this.URL}/${username}`);
    }

    /* ------ Metodo para acceder al perfil del usuario autenticado ------ */
    getMyProfile(): Observable<User> {
        return this.http.get<User>(`${this.URL}/me`);
    }

    /* ------ Metodo para modificar los datos del perfil propio ------ */
    updateUser(username: string, userUpdateDTO: User): Observable<TokenResponse | void> {
        return this.http.put<TokenResponse | void>(`${this.URL}/${username}`, userUpdateDTO);
    }

    /* ------ Metodo para cambiar la contraseña del usuario ------ */
    changePassword(username: string, dto: ChangePassword): Observable<void> {
        return this.http.put<void>(`${this.URL}/${username}/password`, dto);
    }

    /* ------ Metodo para eliminar la cuenta de un usuario ------ */
    deleteUser(username: string): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${username}`);
    }
}