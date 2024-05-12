import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public loggedUser$: Observable<any> = this.loggedUserSubject.asObservable();

  constructor() { }

  setLoggedUser(user: any): void {
    this.loggedUserSubject.next(user);
  }

  getLoggedUser(): Observable<any> {
    return this.loggedUser$;
  }
}