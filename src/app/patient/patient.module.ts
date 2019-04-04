import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PatientPage } from './patient.page';
import { SharedModule } from '../shared/shared.module';
import { PatientCardComponent } from './patient-card/patient-card.component';
import { PatientFormComponent } from './patient-form/patient-form.component';

const routes: Routes = [
  {
    path: '',
    component: PatientPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [PatientPage,PatientCardComponent,PatientFormComponent]
})
export class PatientPageModule {}
