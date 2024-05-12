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
}
