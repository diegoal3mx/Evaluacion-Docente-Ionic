import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { usuario, usuariosIniciales } from 'src/interfaces/usuario';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { maestro, maestrosIniciales } from 'src/interfaces/maestro';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public usuarios: usuario[];
  public maestros: maestro[];
  public usuariosIniciales = usuariosIniciales;
  public maestrosIniciales = maestrosIniciales;

  public username: string;
  public password: string;

  constructor(
    private sqlite: SqliteService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sqlite.dbready.subscribe(async(ready) => {
      if (ready) {
        await this.createDefaultUsers();
        await this.createDefaultMaestros();
      }
    });
  }

  async createDefaultUsers() {
    try {
      for (const usuario of this.usuariosIniciales) {
        await this.create(usuario);
      }
    } catch (Exception) {
      console.log('Error al crear los usuarios por defecto');
    }
  }

  async createDefaultMaestros() {
    try {
      for (const maestro of this.maestrosIniciales) {
        await this.createMaestro(maestro);
      }
    } catch (Exception) {
      console.log('Error al crear los maestros por defecto');
    }
  }

  async create(usuario: usuario) {
    try {
      // Creamos un elemento en la base de datos
      await this.sqlite.create(usuario.id, usuario.username, usuario.password);
      console.log('Usuario creado');
    } catch (err) {
      console.error(err);
      console.error('Error al crear usuario');
    }
  }

  async createMaestro(maestro: maestro) {
    try {
      // Creamos un elemento en la base de datos
      await this.sqlite.createMaestro(
        maestro.id,
        maestro.nombre,
        maestro.materia
      );
      console.log('Maestro creado');
    } catch (err) {
      console.error(err);
      console.error('Error al crear maestro');
    }
  }

  read() {
    // Leemos los datos de la base de datos
    this.sqlite
      .read()
      .then((usuarios: usuario[]) => {
        this.usuarios = usuarios;
        console.log('Leido');
        console.log(this.usuarios);
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
        console.log('Leido');
        console.log(this.maestros);
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al leer');
      });
  }

  login(username: string, password: string) {
    let loginUser = null;
    this.sqlite
      .read()
      .then((usuarios: usuario[]) => {
        this.usuarios = usuarios;
        console.log('Leido');
        console.log(this.usuarios);
        usuarios.forEach((element) => {
          if (element.username === username && element.password === password) {
            loginUser = element;
            this.auth.setLoggedUser(loginUser);
            this.router.navigate(['/dashboard']);
          }
        });

        this.auth.getLoggedUser().subscribe((user) => {
          console.log(user); // Esto mostrará el usuario logueado actualmente
        });
      })
      .catch((err) => {
        console.error(err);
        console.error('Error al traer usuarios');
      });
  }

  logout() {
    this.auth.setLoggedUser(null);
    this.router.navigate(['/']);
    console.log();
  }
}
