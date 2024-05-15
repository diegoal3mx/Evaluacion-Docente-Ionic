import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service'
import { usuario } from 'src/interfaces/usuario';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { maestrosIniciales } from 'src/interfaces/maestro';
import { maestro } from '../../../interfaces/maestro';
import { voto } from '../../../interfaces/voto'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  implements OnInit {
  loggedUser: usuario
  users: usuario[]
  maestros : maestro[] = []
  votos : voto[] = [];

  constructor(private authService: AuthService,private sqlite: SqliteService, private route:ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.sqlite.dbready.subscribe(async(ready) => {
      if (ready) {
        this.authService.getLoggedUser().subscribe(user => {
          this.loggedUser = user;
        });
        this.readMaestros()
        const foundVotos = await this.findVotosById(this.loggedUser.id);
        console.log('imprimir votos on init')
        console.log(foundVotos);
        if(!this.votos){
         this.router.navigate(['dashboard'])
        }
      }
    });


  }

  readMaestros() {
    this.sqlite
      .readMaestros()
      .then((maestros: maestro[]) => {
        this.maestros = maestros;
        console.log('Leido');
        console.log(this.maestros);
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
      });
  }

  irAEvaluacion(id:string){
    console.log('entra');
    this.router.navigate([`evaluacion/${id}`])
  }

  logout(){
    this.authService.setLoggedUser(null)
    this.router.navigate(['/'])
    console.log()
  }

  findVotosById(id:string): Promise<voto[]> {
    return this.sqlite
      .findVotosById(id)
      .then((votos: voto[]) => {
        this.votos = votos;
        console.log('Leido');
        console.log(id)
        console.log(this.votos);
        return votos;
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
        return null;
      });
  }

  checkUserVotos(){
    //console.log(this.loggedUser);
    for(let v of this.votos){
      if(v.idUsuario==this.loggedUser.id){
        console.log('coincide');
        return true;
      }
    }
    return false;
  }

}