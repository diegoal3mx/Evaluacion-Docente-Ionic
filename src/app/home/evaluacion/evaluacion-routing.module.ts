import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EvaluacionPage } from './evaluacion.page';

const routes: Routes = [
  {
    path: '',
    component: EvaluacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluacionPageRoutingModule {}
