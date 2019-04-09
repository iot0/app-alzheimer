import { Directive, Output, EventEmitter, Input, OnInit, ElementRef, Renderer2 } from "@angular/core";
import { LocationService } from "./location.service";
import { NgxConfig } from "ngx-map";
import { convertToBoolProperty } from "../../helper";

@Directive({
  selector: "[appLocation]"
})
export class LocationDirective implements OnInit {
  @Input("appLocation") marker;
  @Input("enableSelection")
  set enableSelection(val) {
    this._enableSelection = convertToBoolProperty(val);
  }
  _enableSelection: boolean = false;

  @Input("disableOnClickTrigger") disableOnClickTrigger: boolean = false;

  @Output("onSelect")
  onLocation: EventEmitter<string> = new EventEmitter();

  constructor(private service: LocationService, private element: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    console.log("Location directive oninit");
    if (!this.disableOnClickTrigger) {
      this.renderer.listen(this.element.nativeElement, "click", this.openMap.bind(this));
    }
  }

  openMap() {
    let props: NgxConfig = {};
    let marker = null;
    try {
      if (!this.marker) {
        marker = { lat: "8.749810", lng: "76.717750" };
      } else {
        marker = JSON.parse(this.marker);
      }
      if (marker.lat && marker.lng) {
        props = {
          ...props,
          marker: marker
        };
      }
    } catch (e) {}
    if (this._enableSelection) {
      props = {
        ...props,
        enableSelection: this._enableSelection
      };
    }
    this.service.openModal(props).then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.data) {
          this.onLocation.emit(res.data);
        }
      });
    });
  }
}
