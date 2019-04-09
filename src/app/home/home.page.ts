import { Component, AfterViewInit, ViewEncapsulation, OnInit } from "@angular/core";
import { PushNotificationsService } from "../shared/services/push-notifications.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { UserService } from "../shared/services/user.service";
import { ThemeService } from "../shared/theme/theme.service";
import { User, UserRole } from "../shared/models/user";
import { Router } from "@angular/router";
import { LocationService } from "../shared/components/location/location.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
  // encapsulation:ViewEncapsulation.None
})
export class HomePage implements OnInit,AfterViewInit {
  
  user: User;
  patient: User;
  drawerOptions: any;
  constructor(
    private push: PushNotificationsService,
    public userService: UserService,
    private themeService: ThemeService,
    private router: Router,
    private mapService: LocationService
  ) {
    this.user = this.userService.currentUserObj();

    this.drawerOptions = {
      handleHeight: 50,
      thresholdFromBottom: 200,
      thresholdFromTop: 200,
      bounceBack: true
    };
  }

  ngAfterViewInit(): void {}

  async ngOnInit(){
    console.log(this.user);
  }
  async onLogOut() {
    await this.themeService.progress(true);
    try {
      this.userService.logOut();
      this.router.navigate(["welcome"]);
    } catch (err) {
      console.dir(err);
      await this.themeService.toast(err.message);
    } finally {
      await this.themeService.progress(false);
    }
  }
  onTracking(latLng) {
    console.log(latLng);
    if (latLng) {
      this.mapService.openModal({ enableSelection: false, marker: JSON.parse(latLng) });
    } else {
      this.themeService.alert("Error", "Invalid locaiton details .");
    }
  }
  async onTrackingPatient() {
    if (this.user.Patient.Uid) {
      let patient = await this.userService.getUserDetailsAsAsync(this.user.Patient.Uid);
      if (patient.CurrentLatLng) {
        this.mapService.openModal({ enableSelection: false, marker: JSON.parse(patient.CurrentLatLng) });
      } else {
        this.themeService.alert("Missing Location Info", "Please check if the device is properly configured for the patient.");
      }
    } else {
      this.themeService.alert("No Patient Added ", "Please add the detail of the patient for tracking.");
    }
  }
  openEvents() {
    if (this.user.Role == UserRole.CareTaker && !(this.user.Patient && this.user.Patient.Uid)) {
      this.themeService.alert("Info", "You need to finish patient registration before adding events");
      return;
    }
    this.router.navigate(["events"]);
  }
  viewPatient() {
    if (this.user.Role == UserRole.CareTaker && this.user.Patient) {
      this.router.navigate([`/patient/${this.user.Patient.Uid}`]);
    } else if (this.user.Role == UserRole.CareTaker) {
      this.router.navigate([`/patient`]);
    } else if (this.user.Role == UserRole.Patient) {
      this.router.navigate([`/patient/${this.user.Uid}`]);
    } else {
      this.themeService.alert("Error", "Invalid User");
    }
  }
}
