import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModule } from './components/location/location.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LocationModule
  ],
  exports:[LocationModule],
  entryComponents:[]
})
export class SharedModule { }
