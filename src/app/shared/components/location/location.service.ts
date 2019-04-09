import { Injectable } from '@angular/core';
import { NgxConfig } from 'ngx-map';
import { ModalController } from '@ionic/angular';
import { LocationModalComponent } from './location-modal.component';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private modalCtrl: ModalController) { }

  async openModal(opts:NgxConfig){
    const modal = await this.modalCtrl.create({
      component: LocationModalComponent,
      componentProps: opts
    });
    await modal.present();
    return modal;
  }
}
