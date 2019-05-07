import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModule } from './components/location/location.module';
import { DrawerComponent } from './components/drawer/drawer.component';
import { IonicModule } from '@ionic/angular';
import { DeviceConnectComponent } from './components/device-connect/device-connect.component';
import { FireImageDirective } from './directives/fire-image.directive';
import { EventDisplayComponent } from './components/event-display/event-display.component';
import { PhotoSwipeDirective } from './directives/photo-swipe.directive';
import { EventDrawerComponent } from './components/event-drawer/event-drawer.component';

@NgModule({
  declarations: [DrawerComponent,DeviceConnectComponent, FireImageDirective,EventDisplayComponent, PhotoSwipeDirective,EventDrawerComponent],
  imports: [
    CommonModule,
    LocationModule,
    IonicModule
  ],
  exports:[LocationModule,DrawerComponent,DeviceConnectComponent,FireImageDirective,EventDisplayComponent,PhotoSwipeDirective,EventDrawerComponent],
  entryComponents:[EventDisplayComponent,EventDrawerComponent]
})
export class SharedModule { }
