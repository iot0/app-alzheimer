import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { EventInfo } from "src/app/shared/models/event";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { ModalController } from "@ionic/angular";
import { UserService } from "src/app/shared/services/user.service";
import { User } from "src/app/shared/models/user";
import { toBrowserTime } from 'src/app/shared/helper';

@Component({
  selector: "app-event-create-modal",
  templateUrl: "./event-create-modal.component.html",
  styleUrls: ["./event-create-modal.component.scss"]
})
export class EventCreateModalComponent implements OnInit {
  createForm: FormGroup;
  todaysDate: string = toBrowserTime();
  user: User;
  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    public modalController: ModalController,
    private userService: UserService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.user = this.userService.currentUserObj();

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
      eventDate: [this.todaysDate, Validators.required],
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
    let user = this.userService.currentUserObj();
    const formModel = this.createForm.value;
    console.log(formModel.eventDate);
    let event: EventInfo = {
      EventDate: new Date(formModel.eventDate).getTime(),
      Description: formModel.description,
      IsLocationEvent: formModel.isLocationEvent,
      Title: formModel.title,
      CreatedBy: { Uid: user.Uid, FullName: user.FullName }
    };
    if (event.IsLocationEvent) {
      event.Address = formModel.address;
      event.LatLng = formModel.latLng as string;
    }
    return event;
  }

  async onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid) {
      this.themeService.progress(true);
      let data = this.prepareSaveInfo();

      try {
        let res = await this.userService.addEvents(this.user.Patient.Uid, data);
        this.themeService.alert("Success", "Event added successfully");
        this.onClose();
      } catch (err) {
        console.log(err);
        await this.themeService.progress(false);
        this.themeService.alert("Error", "Not able to add this event .");
      } finally {
        this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
