import { Component, ViewChild, OnInit } from "@angular/core";
import { AuthService } from '../../services/auth.service';
import { usuario } from 'src/interfaces/usuario';
import { SqliteService } from 'src/app/services/sqlite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { maestro } from '../../../interfaces/maestro';
import { voto } from '../../../interfaces/voto';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  colors: string[];
};

@Component({
  selector: 'app-bars',
  templateUrl: './bars.component.html',
  styleUrls: ['./bars.component.scss'],
})
export class BarsComponent implements OnInit {
  votos: voto[] = [];
  maestros: maestro[] = [];
  loggedUser: usuario;
  nombresMaestros: String[] = [];
  
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions> = null;

  constructor(
    private authService: AuthService, 
    private sqlite: SqliteService, 
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit() {
    this.sqlite.dbready.subscribe(async (ready) => {
      if (ready) {
        this.authService.getLoggedUser().subscribe(async user => {
          this.loggedUser = user;
          this.votos = await this.readVotos();
          this.maestros = await this.getMaestros();

          const resultsPromises = this.maestros.map(maestro => this.getResults(maestro));
          const results = await Promise.all(resultsPromises);
          this.nombresMaestros = this.maestros.map(maestro => maestro.nombre);

          this.chartOptions = {
            series: [
              {
                name: "Points",
                data: results
              }
            ],
            chart: {
              height: 350,
              type: "bar"
            },
            colors: [
              "#d86e2c",
            ],
            xaxis: {
              categories: this.nombresMaestros,
              labels: {
                style: {
                  colors: this.nombresMaestros.map(() => '#FFFFFF') // Asignar color blanco a todas las etiquetas
                }
              }
            },
            title: {
              text: ''
            }
          };
        });
      }
    });
  }

  async getResults(maestro: maestro): Promise<number> {
    let idMaestro = maestro.id;
    let sumaVotos = 0;
    let numVotos = 0;
    let result = 0;
    for (const voto of this.votos) {
      if (voto.idMaestro == idMaestro) {
        sumaVotos += voto.puntuacion;
        numVotos += 1;
      }
    }
    if (numVotos > 0) {
      result = sumaVotos / numVotos;
    }
    return result;
  }
  
  async readVotos(): Promise<voto[]> {
    try {
      const votos = await this.sqlite.readVotos();
      return votos;
    } catch (err) {
      console.error(err);
      console.error('Error al leer');
      return [];
    }
  }

  async getMaestros(): Promise<maestro[]> {
    try {
      const maestros = await this.sqlite.readMaestros();
      return maestros;
    } catch (err) {
      console.error(err);
      console.error('Error al leer');
      return [];
    }
  }

  logout() {
    this.authService.setLoggedUser(null);
    this.router.navigate(['/']);
  }

  back() {
    this.router.navigate(['dashboard']);
  }
}