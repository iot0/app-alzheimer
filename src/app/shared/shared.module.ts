import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModule } from './components/location/location.module';
import { DrawerComponent } from './components/drawer/drawer.component';
import { IonicModule } from '@ionic/angular';
import { DeviceConnectComponent } from './components/device-connect/device-connect.component';

@NgModule({
  declarations: [DrawerComponent,DeviceConnectComponent],
  imports: [
    CommonModule,
    LocationModule,
    IonicModule
  ],
  exports:[LocationModule,DrawerComponent,DeviceConnectComponent],
  entryComponents:[]
})
export class SharedModule { }
