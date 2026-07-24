import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, TokenResponse, ChangePassword, UserPreview } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  /* ! ======== API para acceder al UserController ======== */
  private readonly URL = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  /* ------ Metodo para obtener la lista general de usuarios ------ */
  getUsers(): Observable<UserPreview[]> {
    return this.http.get<UserPreview[]>(`${this.URL}/all`);
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
    console.log("Service | Username (Viejo) =" + username);
    console.log("Service | userUpdateDTO (Nuevo) =" + userUpdateDTO.username);
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