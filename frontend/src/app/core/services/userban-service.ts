import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBanResponse, UserBanPreview, PageResponse } from '../models';

@Injectable({
    providedIn: 'root',
})
export class UserbanService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/users';
    private bansUrl = 'http://localhost:8080/bans';

    // <----- Banear Usuario ----->
    banUser(username: string, reason: string): Observable<UserBanResponse> {
        return this.http.post<UserBanResponse>(`${this.apiUrl}/${username}/ban`, { reason });
    }

    // <----- Desbanear Usuario ----->
    unbanUser(username: string): Observable<UserBanResponse> {
        return this.http.put<UserBanResponse>(`${this.apiUrl}/${username}/ban`, {});
    }

    // <----- Obtener Último Baneo ----->
    getUserLastBanInfo(username: string): Observable<UserBanResponse> {
        return this.http.get<UserBanResponse>(`${this.apiUrl}/${username}/ban`);
    }

    // <----- Obtener Historial de Baneos Paginado ----->
    getUserBanHistory(username: string, page: number = 1): Observable<PageResponse<UserBanPreview>> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<PageResponse<UserBanPreview>>(`${this.apiUrl}/${username}/bans`, { params });
    }

    // <----- Obtener Baneo por ID ----->
    getBanById(banId: number): Observable<UserBanResponse> {
        return this.http.get<UserBanResponse>(`${this.bansUrl}/${banId}`);
    }
}