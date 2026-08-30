import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBanResponse, UserBanPreview } from '../models';
import { PageResponse } from '../models/common/page-response';

@Injectable({
    providedIn: 'root',
})
export class UserbanService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/users';
    private bansUrl = 'http://localhost:8080/bans';

    // Banear usuario (POST /users/{username}/ban) -> Enviamos un objeto con { reason }
    banUser(username: string, reason: string): Observable<UserBanResponse> {
        return this.http.post<UserBanResponse>(`${this.apiUrl}/${username}/ban`, { reason });
    }

    // Desbanear usuario (PUT /users/{username}/ban)
    unbanUser(username: string): Observable<UserBanResponse> {
        return this.http.put<UserBanResponse>(`${this.apiUrl}/${username}/ban`, {});
    }

    // Obtener último ban (GET /users/{username}/ban)
    getUserLastBanInfo(username: string): Observable<UserBanResponse> {
        return this.http.get<UserBanResponse>(`${this.apiUrl}/${username}/ban`);
    }

    // Obtener historial de bans paginado (GET /users/{username}/bans?page=1)
    getUserBanHistory(username: string, page: number = 1): Observable<PageResponse<UserBanPreview>> {
        const params = new HttpParams().set('page', page);
        return this.http.get<PageResponse<UserBanPreview>>(`${this.apiUrl}/${username}/bans`, { params });
    }

    // Obtener ban por ID (GET /bans/{banId})
    getBanById(banId: number): Observable<UserBanResponse> {
        return this.http.get<UserBanResponse>(`${this.bansUrl}/${banId}`);
    }
}