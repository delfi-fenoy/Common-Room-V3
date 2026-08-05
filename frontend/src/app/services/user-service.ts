import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import UserPreview from '../models/UserPreview';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import TokenResponse from '../models/TokenResponse';
import ChangePassword from '../models/ChangePassword';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //URL del backend
  private URL = 'http://localhost:8080/users'

  constructor(private http: HttpClient) {}

  //Obtengo la lista de usuarios
  //Observable sirve para representar un valor que llegará en el futuro (asincrono)
  getUsers(): Observable<UserPreview[]> {
    return this.http.get<UserPreview[]>(`${this.URL}/all`)
  }

  //Perfil público
  getUserProfile(username: string): Observable<User>{
    return this.http.get<User>(`${this.URL}/${username}`)
  }

  //Perfil propio
  getMyProfile(): Observable<User>{
    return this.http.get<User>(`${this.URL}/me`)
  }

  //Modificar perfil propio
  //El backend devueleve un TokenResponse si se modifica el username
  updateUser(username: string, userUpdateDTO: User): Observable<TokenResponse | void>{
    console.log("Service | Username (Viejo) =" + username)
    console.log("Service | userUpdateDTO (Nuevo) =" + userUpdateDTO.username)
    return this.http.put<TokenResponse | void>(`${this.URL}/${username}`, userUpdateDTO)
  }

  //Cambiar contraseña
  changePassword(username: string, dto: ChangePassword): Observable<void>{
    return this.http.put<void>(`${this.URL}/${username}/password`, dto)
  }

  //Eliminar perfil
  deleteUser(username: string): Observable<void>{
    return this.http.delete<void>(`${this.URL}/${username}`)
  }

  // Obtener usuarios paginados (para seccion users)
  getUsersPaged(page: number = 1, role?: string): Observable<any> 
  {
    let params = new HttpParams().set('page', page)
    if (role) 
    {
      params = params.set('role', role)
    }
    return this.http.get<any>(`${this.URL}/paged`, { params: params })
  }

  // Buscar usuarios por nombre (busqueda general)
  searchUsers(query: string, page: number = 1, role?: string): Observable<any> 
  {
    let params = new HttpParams().set('page', page)
    if (role) 
    {
      params = params.set('role', role)
    }
    return this.http.get<any>(`${this.URL}/search/${query}`, { params: params })
  }

  //ADMIN Listar o buscar usuarios baneados
  getBannedUsers(page: number = 1, query?: string): Observable<any> 
  {
    let params = new HttpParams().set('page', page)
    if (query) 
    {
      params = params.set('query', query)
    }
    return this.http.get<any>(`${this.URL}/banned`, { params: params })
  }
}
