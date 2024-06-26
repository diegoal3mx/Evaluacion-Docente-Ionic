import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './pages/dashboard/dashboard.component'
import { AuthGuard } from './guards/auth.guard';
import { loggedUser } from './guards/loggedUser.guard';
import { BarsComponent } from './pages/bars/bars.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [loggedUser]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',

  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluacion/:id',
    loadChildren: () => import('./pages/evaluacion/evaluacion.module').then( m => m.EvaluacionPageModule)
  },
  {
    path: 'bars',
    component: BarsComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
