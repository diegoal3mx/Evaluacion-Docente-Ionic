import { Component, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { maestro } from 'src/interfaces/maestro';
import { ActivatedRoute, Router } from '@angular/router';
import { votosIniciales, voto as votosInterface} from 'src/interfaces/voto';
import { loggedUser } from 'src/app/guards/loggedUser.guard';
import { usuario } from 'src/interfaces/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.page.html',
  styleUrls: ['./evaluacion.page.scss'],
})
export class EvaluacionPage implements OnInit {
  selectedValues: number[] = [];
  preguntas: String[] = [
    '¿El docente muestra interés para que los estudiantes aprendan?',
    '¿El docente tiene una buena relación con los estudiantes en el aula de clase?',
    '¿El profesor relaciona los saberes enseñados con el programa de estudio?',
    '¿El docente demuestra dominio en su área o disciplina?',
    '¿El docente promueve y facilita el aprendizaje de los contenidos de los estudiantes?'
  ];
  public maestro: maestro = { id: '', nombre: '', materia: '' };
  public foundMaestro: maestro
  loggedUser: usuario
  idMaestro:string='';
  puntuacion:number=0;

  constructor(private authService: AuthService, private sqlite: SqliteService, private route:ActivatedRoute, private router: Router) {
    this.preguntas.forEach(() =>{
      this.selectedValues.push(1);
    })
   }

  ngOnInit() {
    this.sqlite.dbready.subscribe(async(ready) => {
      if (ready) {
        this.foundMaestro = await this.findMaestroById(this.route.snapshot.paramMap.get('id'))
        if(!this.foundMaestro){
         this.router.navigate(['dashboard'])
        }
      }
    });
    this.sqlite.dbready.subscribe(async(ready) => {
      if (ready) {
        this.authService.getLoggedUser().subscribe(user => {
          this.loggedUser = user;
        });
      }
    });
  }

  findMaestroById(id:string): Promise<maestro> {
    return this.sqlite
      .findMaestroById(id)
      .then((maestro: maestro) => {
        this.maestro = maestro;
        console.log('Leido');
        console.log(id)
        console.log(this.maestro);
        return maestro;
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
        return null;
      });
  }

  async guardarVotos(){
    try {
      // Creamos un elemento en la base de datos
      let index = 0; 
      for(let p in this.preguntas){
        console.log(p);
        index++;
        console.log('antes de create')
        await this.sqlite.createVoto('m'+index, this.loggedUser.id, this.foundMaestro.id, this.selectedValues[index-1]);
      console.log('Voto creado');
      }
      var res = await this.sqlite.readVotos();
      console.log('imprimiendo voto');
      console.log(res);
    } catch (err) {
      console.error(err);
      console.log(err)
      console.error('Error al crear voto');
    }
  
  }
}
