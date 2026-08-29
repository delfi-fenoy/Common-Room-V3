import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBanResponseDTO, UserBanPreviewDTO } from '../models';
import { PageResponse } from '../models/common/page-response';

@Injectable({
    providedIn: 'root',
})
export class UserbanService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/users';
    private bansUrl = 'http://localhost:8080/bans';

    // Banear usuario (POST /users/{username}/ban) -> Enviamos un objeto con { reason }
    banUser(username: string, reason: string): Observable<UserBanResponseDTO> {
        return this.http.post<UserBanResponseDTO>(`${this.apiUrl}/${username}/ban`, { reason });
    }

    // Desbanear usuario (PUT /users/{username}/ban)
    unbanUser(username: string): Observable<UserBanResponseDTO> {
        return this.http.put<UserBanResponseDTO>(`${this.apiUrl}/${username}/ban`, {});
    }

    // Obtener último ban (GET /users/{username}/ban)
    getUserLastBanInfo(username: string): Observable<UserBanResponseDTO> {
        return this.http.get<UserBanResponseDTO>(`${this.apiUrl}/${username}/ban`);
    }

    // Obtener historial de bans paginado (GET /users/{username}/bans?page=1)
    getUserBanHistory(username: string, page: number = 1): Observable<PageResponse<UserBanPreviewDTO>> {
        const params = new HttpParams().set('page', page);
        return this.http.get<PageResponse<UserBanPreviewDTO>>(`${this.apiUrl}/${username}/bans`, { params });
    }

    // Obtener ban por ID (GET /bans/{banId})
    getBanById(banId: number): Observable<UserBanResponseDTO> {
        return this.http.get<UserBanResponseDTO>(`${this.bansUrl}/${banId}`);
    }
}