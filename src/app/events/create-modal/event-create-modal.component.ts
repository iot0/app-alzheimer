import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { EventInfo } from "src/app/shared/models/event";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { EventsService } from "src/app/shared/services/events.service";
import { ModalController } from '@ionic/angular';

@Component({
  selector: "app-event-create-modal",
  templateUrl: "./event-create-modal.component.html",
  styleUrls: ["./event-create-modal.component.scss"]
})
export class EventCreateModalComponent implements OnInit {
  createForm: FormGroup;
  todaysDate:string=(new Date()).toISOString();

  constructor(private fb: FormBuilder,
     private themeService: ThemeService,
     public modalController: ModalController,
      private eventsService: EventsService) {
    this.initForm();
  }

  ngOnInit() {
    this.createForm.get("isLocationEvent").statusChanges.subscribe(status => {
      if (status === "VALID") {
        this.createForm.get("latLng").enable();
        this.createForm.get("address").enable();
      } else {
        this.createForm.get("latLng").disable();
        this.createForm.get("address").disable();
      }
    });
  }

  initForm() {
    this.createForm = this.fb.group({
      title: ["", Validators.required],
      eventDate: ["", Validators.required],
      isLocationEvent: [false, Validators.required],
      latLng: ["", Validators.required],
      address: ["", Validators.required],
      description: ["", Validators.required]
    });

    this.createForm.get("latLng").disable();
    this.createForm.get("address").disable();
  }

  onLocationSelect(location) {
    if (location) {
      this.createForm.get("latLng").setValue(JSON.stringify(location));
    }
  }
  onClose() {
    this.modalController.dismiss();
  }

  prepareSaveInfo(): EventInfo {
    const formModel = this.createForm.value;
    let event: EventInfo = {
      EventDate: formModel.eventDate,
      Description: formModel.description,
      IsLocationEvent: formModel.isLocationEvent,
      Title: formModel.title
    };
    if (event.IsLocationEvent) {
      event.Address = formModel.address;
      event.LatLng = formModel.latLng as string;
    }
    return event;
  }

  onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid) {
      this.themeService.progress(true);
      let data = this.prepareSaveInfo();

      this.eventsService.register(data)
        .then(res => {
          this.themeService.alert("Success", "Event added successfully");
        })
        .catch(err => {
          this.themeService.alert("Error", "Not able to add this event .");
        })
        .finally(() => {
          this.themeService.progress(false);
        });
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
