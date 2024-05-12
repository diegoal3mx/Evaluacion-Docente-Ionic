import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { usuario } from 'src/interfaces/usuario';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public usuarios: usuario[]
  public usuariosIniciales: usuario[] = [];

  public username: string;
  public password: string;

  public usuario1: usuario = {id:"165387badj83", username:"ivan", password:"161201"}
  public usuario2: usuario = {id:"105387bbdj83", username:"vale", password:"101002"}
  public usuario3: usuario = {id:"185387bcdj83", username:"diego", password:"180903"}
  public usuario4: usuario = {id:"265387bddj83", username:"uriel", password:"260403"}

  constructor(private sqlite: SqliteService, private auth: AuthService, private router: Router) {
    this.usuariosIniciales.push(this.usuario1);
    this.usuariosIniciales.push(this.usuario2);
    this.usuariosIniciales.push(this.usuario3);
    this.usuariosIniciales.push(this.usuario4);
  }

  ngOnInit(){
    this.sqlite.dbready.subscribe((ready)=>{
      if(ready){
        this.createDefaultUsers();
      }
    })
  }

  async createDefaultUsers(){
    try{
      for (const usuario of this.usuariosIniciales) {
        await this.create(usuario)
      }
    }
    catch(Exception){
      console.log("Error al crear los usuarios por defecto");
    }
  }

  async create(usuario: usuario) {
    try {
      // Creamos un elemento en la base de datos
      await this.sqlite.create(usuario.id, usuario.username, usuario.password);
      console.log("Usuario creado");
    } catch (err) {
      console.error(err);
      console.error("Error al crear usuario");
    }
  }

  read(){
    // Leemos los datos de la base de datos
    this.sqlite.read().then( (usuarios: usuario[]) => {
      this.usuarios = usuarios;
      console.log("Leido");
      console.log(this.usuarios);
    }).catch(err => {
      console.error(err);
      console.error("Error al leer");
    })
  }

  login(username:string, password:string){
    let loginUser = null
    this.sqlite.read().then( (usuarios: usuario[]) => {
      this.usuarios = usuarios;
      console.log("Leido");
      console.log(this.usuarios);
      usuarios.forEach((element) => {
        if(element.username === username && element.password === password){
          loginUser = element
          this.auth.setLoggedUser(loginUser)
          this.router.navigate(['/dashboard'])
        }
      })

      this.auth.getLoggedUser().subscribe(user => {
        console.log(user); // Esto mostrará el usuario logueado actualmente
      });

    }).catch(err => {
      console.error(err);
      console.error("Error al traer usuarios");
    })
  }

  logout(){
    this.auth.setLoggedUser(null)
    console.log()
  }



}
