import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedUserSubject: BehaviorSubject<any>;

  constructor() {
    // Intenta obtener el usuario autenticado del almacenamiento local al iniciar el servicio
    const storedUser = localStorage.getItem('loggedUser');
    this.loggedUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
  }

  setLoggedUser(user: any): void {
    // Actualiza el usuario autenticado en el BehaviorSubject y también en el almacenamiento local
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.loggedUserSubject.next(user);
  }

  getLoggedUser(): Observable<any> {
    return this.loggedUserSubject.asObservable();
  }

  logout(): void {
    // Elimina el usuario autenticado del BehaviorSubject y del almacenamiento local al cerrar la sesión
    localStorage.removeItem('loggedUser');
    this.loggedUserSubject.next(null);
  }
}