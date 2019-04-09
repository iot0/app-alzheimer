import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FamilyPage } from './family.page';
import { FamilyCardComponent } from './family-card/family-card.component';
import { FamilyFormComponent } from './family-form/family-form.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: FamilyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [FamilyPage,FamilyCardComponent,FamilyFormComponent]
})
export class FamilyPageModule {}
