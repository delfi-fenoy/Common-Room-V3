import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, TokenResponse, ChangePassword, UserPreview, Page } from '../models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    /* ! ======== API para acceder al UserController ======== */
    private readonly URL = 'http://localhost:8080/users';

    constructor(private http: HttpClient) {}

    /* ------ Método para obtener la lista general de usuarios (legacy) ------ */
    getUsers(): Observable<UserPreview[]> {
        return this.http.get<UserPreview[]>(`${this.URL}/all`);
    }

    /* ------ Obtener usuarios paginados y filtrados por rol ------ */
    getUsersPaged(role?: string, page: number = 1): Observable<Page<UserPreview>> {
        let params = new HttpParams().set('page', page.toString());
        
        if (role && role !== 'all') {
            // Mapeo de select a enum Role de Java (ADMIN / USER)
            const roleParam = role === 'admins' ? 'ADMIN' : role === 'members' ? 'USER' : role;
            params = params.set('role', roleParam);
        }

        return this.http.get<Page<UserPreview>>(`${this.URL}/paged`, { params });
    }

    /* ------ Buscar usuarios por nombre y rol opcional ------ */
    searchUsers(query: string, role?: string, page: number = 1): Observable<Page<UserPreview>> {
        let params = new HttpParams().set('page', page.toString());

        if (role && role !== 'all') {
            const roleParam = role === 'admins' ? 'ADMIN' : role === 'members' ? 'USER' : role;
            params = params.set('role', roleParam);
        }

        return this.http.get<Page<UserPreview>>(`${this.URL}/search/${encodeURIComponent(query)}`, { params });
    }

    /* ------ Obtener usuarios baneados (Sección Admin) ------ */
    getBannedUsers(query?: string, page: number = 1): Observable<Page<UserPreview>> {
        let params = new HttpParams().set('page', page.toString());

        if (query) {
            params = params.set('query', query);
        }

        return this.http.get<Page<UserPreview>>(`${this.URL}/banned`, { params });
    }

    /* ------ Método para acceder al perfil publico de un usuario ------ */
    getUserProfile(username: string): Observable<User> {
        return this.http.get<User>(`${this.URL}/${username}`);
    }

    /* ------ Método para acceder al perfil del usuario autenticado ------ */
    getMyProfile(): Observable<User> {
        return this.http.get<User>(`${this.URL}/me`);
    }

    /* ------ Método para modificar los datos del perfil propio ------ */
    updateUser(username: string, userUpdateDTO: User): Observable<TokenResponse | void> {
        return this.http.put<TokenResponse | void>(`${this.URL}/${username}`, userUpdateDTO);
    }

    /* ------ Método para cambiar la contraseña del usuario ------ */
    changePassword(username: string, dto: ChangePassword): Observable<void> {
        return this.http.put<void>(`${this.URL}/${username}/password`, dto);
    }

    /* ------ Método para eliminar la cuenta de un usuario ------ */
    deleteUser(username: string): Observable<void> {
        return this.http.delete<void>(`${this.URL}/${username}`);
    }
}