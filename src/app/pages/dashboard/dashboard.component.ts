import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { usuario } from 'src/interfaces/usuario';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { maestrosIniciales } from 'src/interfaces/maestro';
import { maestro } from '../../../interfaces/maestro';
import { voto } from '../../../interfaces/voto'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loggedUser: usuario
  users: usuario[]
  maestros: maestro[] = []
  votos: voto[] = [];
  estados = [];

  constructor(private authService: AuthService, private sqlite: SqliteService, private route: ActivatedRoute, private router: Router, public navCtrl: NavController) { }

  ngOnInit() {
    this.sqlite.dbready.subscribe(async (ready) => {
      if (ready) {
        this.authService.getLoggedUser().subscribe(user => {
          this.loggedUser = user;
        });
        this.readMaestros();
        this.votos = await this.sqlite.readVotos();
        if (!this.votos) {
          this.router.navigate(['dashboard'])
        }
      }
    });
  }

  ionViewWillEnter() {
    this.checkVotos()
  }

  async checkVotos(){
    this.estados = []
    this.votos = await this.sqlite.readVotos();
    for (var m of this.maestros) {
      this.estados.push(this.getEstadoBoton(m));
    }
  }

  readVotos() {
    this.sqlite
      .readVotos()
      .then((votos: voto[]) => {
        this.votos = votos;
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
      });
  }

  readMaestros() {
    this.sqlite
      .readMaestros()
      .then((maestros: maestro[]) => {
        this.maestros = maestros;
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
      });
  }

  irAEvaluacion(id: string) {
    this.router.navigate([`evaluacion/${id}`]);
  }

  irAGrafica(){
    this.router.navigate([`bars/`]);
  }

  logout() {
    this.authService.setLoggedUser(null)
    this.router.navigate(['/'])
  }

  

  getEstadoBoton(maestro) {
        for (var v of this.votos) {
          if(this.loggedUser.id==v.idUsuario){
            if (v.idMaestro == maestro.id) {
              return true;
            }
      }
    }
    
    return false;
  }
}