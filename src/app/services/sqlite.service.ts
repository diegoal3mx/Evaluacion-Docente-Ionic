import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  JsonSQLite,
  capSQLiteChanges,
  capSQLiteValues,
} from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { usuario as usuarioInterface } from '../../interfaces/usuario';
import { maestro as maestroInterface } from 'src/interfaces/maestro';
import { voto as votosInterface} from 'src/interfaces/voto';

interface usuario {
  id: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  public dbready: BehaviorSubject<boolean>;
  public isWeb: boolean;
  public isIOS: boolean;
  public dbName: string;
  public usuarios: usuarioInterface[];
  public votos:votosInterface[];

  constructor(private http: HttpClient) {
    this.dbready = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIOS = false;
    this.dbName = '';
    this.usuarios = []
  }

  async init() {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error('Esta app necesita permisos para funcionar');
      }
    } else if (info.platform == 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform == 'ios') {
      this.isIOS = true;
    }

    await this.setupDatabase();
  }

  async setupDatabase() {
    const dbSetup = await Preferences.get({ key: 'first_setup_key' });

    if (!dbSetup.value) {
      await this.downloadDatabase();
    } else {
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbready.next(true);
    }
  }

  async downloadDatabase() {
    this.http
      .get('assets/db/db.json')
      .subscribe(async (jsonExport: JsonSQLite) => {
        const jsonstring = JSON.stringify(jsonExport);
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

        if (isValid.result) {

          this.dbName = jsonExport.database;
          await CapacitorSQLite.importFromJson({ jsonstring });
          await CapacitorSQLite.createConnection({ database: this.dbName });
          await CapacitorSQLite.open({ database: this.dbName });

          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });

          this.dbready.next(true);
        }
      });
  }

  async getDbName() {
    if (!this.dbName) {
      const dbName = await Preferences.get({ key: 'dbname' });
      if (dbName.value) {
        this.dbName = dbName.value;
      }
    }
    return this.dbName;
  }

  async create(id: string, username: string, password: string) {
  let sql = `
  INSERT INTO usuario VALUES(?, ?, ?)
  `;

  try {
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            id, username, password
          ]
        }
      ],transaction:true
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      
      return changes;
    }).catch(err => Promise.reject(err))
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async createMaestro(id: string, nombre: string, materia: string) {
  let sql = `
  INSERT INTO maestro VALUES(?, ?, ?)
  `;

  try {
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            id, nombre, materia
          ]
        }
      ],transaction:true
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      
      return changes;
    }).catch(err => Promise.reject(err))
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async createVoto(idUsuario:string, idMaestro:string, puntuacion:number){
  let sql = `
  INSERT INTO voto (idUsuario, idMaestro, puntuacion) VALUES(?, ?, ?)
  `;

  try {
    // Obtengo la base de datos
    console.log('entra a atry sqlito');
    const dbName = await this.getDbName();
    console.log('despues de getdb'+dbName);
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            idUsuario, idMaestro, puntuacion
          ]
        }
      ],transaction:true
    }).then((changes: capSQLiteChanges) => {
      console.log('entra a then');
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      
      return changes;
    }).catch(err => Promise.reject(err))
  } catch (err) {
    console.log('Error al crear voto sqlito');
    console.error(err);
    throw err;
  }
}


  async read() {
    const sql = 'SELECT * FROM usuario';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [],
    })
    .then((response: capSQLiteValues) => {
        let usuarios: usuarioInterface[] = [];

        if (this.isIOS && response.values.length > 0) {
          response.values.shift();
        }

        for (let index = 0; index < response.values.length; index++) {
          const usuario = response.values[index];
          usuarios.push(usuario);
        }
        return usuarios;
      })
      .catch((err) => Promise.reject(err));
  }



  async readMaestros() {
    const sql = 'SELECT * FROM maestro';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [],
    })
    .then((response: capSQLiteValues) => {
        let maestros: maestroInterface[] = [];

        if (this.isIOS && response.values.length > 0) {
          response.values.shift();
        }

        for (let index = 0; index < response.values.length; index++) {
          const maestro = response.values[index];
          maestros.push(maestro);
        }
        return maestros;
      })
      .catch((err) => Promise.reject(err));
  }

  async findMaestroById(id: string) {
    const sql = 'SELECT * FROM maestro WHERE id = ?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [id], // Pasar el ID como valor para la consulta
    })
    .then((response: capSQLiteValues) => {
        let maestro: maestroInterface = null;
  
        if (this.isIOS && response.values.length > 0) {
          response.values.shift();
        }
  
        for (let index = 0; index < response.values.length; index++) {
          const foundMaestro = response.values[index];
          maestro=foundMaestro;
        }
        return maestro;
      })
      .catch((err) => Promise.reject(err));
  }

  async readVotos() {
    const sql = 'SELECT * FROM voto';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [],
    })
    .then((response: capSQLiteValues) => {
        let votos: votosInterface[] = [];

        if (this.isIOS && response.values.length > 0) {
          response.values.shift();
        }

        for (let index = 0; index < response.values.length; index++) {
          const voto = response.values[index];
          votos.push(voto);
        }
        console.log(votos);
        return votos;
      })
      .catch((err) => Promise.reject(err));
  }

  async findVotosByIdh(id:string){
    const sql = 'SELECT * FROM voto WHERE idUsuario = ?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [id], // Pasar el ID como valor para la consulta
    })
    .then((response: capSQLiteValues) => {
        let votos: votosInterface[] = null;
  
        if (this.isIOS && response.values.length > 0) {
          response.values.shift();
        }
  
        for (let index = 0; index < response.values.length; index++) {
          console.log()
          const foundVoto = response.values[index];
          votos.push(foundVoto);
        }
        return votos;
      })
      .catch((err) => Promise.reject(err));
  }
}