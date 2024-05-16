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
    console.log('Entra a ionViewWillEnter')
    this.checkVotos()
  }

  async checkVotos(){
    this.estados = []
    this.votos = await this.sqlite.readVotos();
    console.log('maestros', this.maestros)
    for (var m of this.maestros) {
      console.log('maestro',m)
      this.estados.push(this.getEstadoBoton(m));
    }

    console.log('estados despues de llenar arreglo:')
    console.log(this.estados)
    console.log(this.votos)
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

  imprimirVotos(){
    console.log('imprimiendo votos...')
    console.log(this.votos)
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
    console.log()
  }

  

  getEstadoBoton(maestro) {
    console.log('comparando voto.idmaestro con maestro.id')
        for (var v of this.votos) {
          console.log(v.idMaestro,' ? ',maestro.id)
          if(this.loggedUser.id==v.idUsuario){
            if (v.idMaestro == maestro.id) {
              console.log('maestro votado: ',maestro.nombre)
              return true;
            }
      }
    }
    
    return false;
  }
}