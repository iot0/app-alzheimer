import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Mapster } from "projects/ngx-map/src/public-api";

@Component({
  selector: "app-location-modal",
  templateUrl: "./location-modal.component.html",
  styleUrls: ["./location-modal.component.scss"]
})
export class LocationModalComponent implements OnInit {
  loading: boolean = true;
  @Input("enableSelection") enableSelection = true;
  selectedLoc;
  marker: any;
  mapster: Mapster;
  constructor(public modalController: ModalController) {
    this.loading = true;
  }

  ngOnInit() {}

  onClose() {
    this.modalController.dismiss();
  }

  onMapInit(res) {
    console.log(res);
    if (res.instance) this.mapster = res.instance;
    this.loading = false;
  }
  onSelect() {
    if (this.mapster && this.mapster.markers && this.mapster.markers.items.length > 0) {
      console.log(this.mapster.markers.items[0].position);
      this.modalController.dismiss(this.mapster.markers.items[0].position);
    } else alert("No Location selected .");
  }
}
