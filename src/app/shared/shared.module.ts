import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModule } from './components/location/location.module';
import { DrawerComponent } from './components/drawer/drawer.component';
import { IonicModule } from '@ionic/angular';
import { DeviceConnectComponent } from './components/device-connect/device-connect.component';
import { FireImageDirective } from './directives/fire-image.directive';
import { EventDisplayComponent } from './components/event-display/event-display.component';

@NgModule({
  declarations: [DrawerComponent,DeviceConnectComponent, FireImageDirective,EventDisplayComponent],
  imports: [
    CommonModule,
    LocationModule,
    IonicModule
  ],
  exports:[LocationModule,DrawerComponent,DeviceConnectComponent,FireImageDirective,EventDisplayComponent],
  entryComponents:[EventDisplayComponent]
})
export class SharedModule { }
