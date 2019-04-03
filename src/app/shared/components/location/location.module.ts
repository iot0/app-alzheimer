import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModalComponent } from './location-modal.component';
import { IonicModule } from '@ionic/angular';
import { LocationDirective } from './location.directive';
import { NgxMapModule } from 'ngx-map';

@NgModule({
  declarations: [LocationModalComponent,LocationDirective],
  imports: [
    CommonModule,
    IonicModule,
    NgxMapModule
  ],
  exports:[LocationModalComponent,LocationDirective],
  entryComponents:[LocationModalComponent]
})
export class LocationModule { }
