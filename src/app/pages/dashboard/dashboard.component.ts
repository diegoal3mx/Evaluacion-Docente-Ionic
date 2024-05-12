import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service'
import { usuario } from 'src/interfaces/usuario';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  implements OnInit {
  loggedUser: usuario
  users: usuario[]

  constructor(private authService: AuthService,private sqlite: SqliteService) { }

  ngOnInit() {
    this.authService.getLoggedUser().subscribe(user => {
      this.loggedUser = user;
    });

    this.sqlite.read().then( (usuarios: usuario[]) => {
      this.users = usuarios;
      console.log("Leido");
      console.log(this.users);
    }).catch(err => {
      console.error(err);
      console.error("Error al leer");
    })

    console.log('1desde dahsboard', this.users)

    console.log('Desde dashboard!', this.loggedUser)
  }

}