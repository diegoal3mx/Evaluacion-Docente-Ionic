import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

var prov;
export const AuthGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router)
  var loggedUser = inject(AuthService).getLoggedUser().subscribe(user => { // Esto mostrará el usuario logueado actualmente
    prov = user;
  });

  loggedUser = prov;
    

  if(loggedUser !== null){
    return true
  }else {
    router.navigate(['/'])
    return false
  }
}