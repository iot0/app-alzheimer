import {
  Directive,
  NgZone,
  HostListener,
  Output,
  EventEmitter,
  Input,
  OnInit
} from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LocationModalComponent } from './location-modal.component';

@Directive({
  selector: "[appLocation]"
})
export class LocationDirective implements OnInit{
  

  @Input("appLocation") marker;
  @Input("enableSelection") enableSelection;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
   console.log("Location directive oninit");
  }
  @Output("onSelect")
  onLocation:EventEmitter<any>=new EventEmitter();

  @HostListener("click")
  async openMap() {
    let props={};
    if (this.marker) {
      try {
        let marker = JSON.parse(this.marker);
        if (marker.lat && marker.lng) {
          props={
            ...props,
            marker:marker
          };
        }
      } catch (e) {}
    }
    if(this.enableSelection){
      props={
        ...props,
        enableSelection: this.enableSelection
      };
    }
    const modal = await this.modalCtrl.create({
        component: LocationModalComponent,
        componentProps:props
      });
      modal.onWillDismiss().then(res => {
        if (res.data) {
          this.onLocation.emit(res.data);
        }
      })
      return await modal.present();
  }
}
