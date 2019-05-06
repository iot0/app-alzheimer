import { Component, AfterViewInit, ViewEncapsulation, OnInit } from "@angular/core";
import { PushNotificationsService } from "../shared/services/push-notifications.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { UserService } from "../shared/services/user.service";
import { ThemeService } from "../shared/theme/theme.service";
import { User, UserRole } from "../shared/models/user";
import { Router } from "@angular/router";
import { LocationService } from "../shared/components/location/location.service";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { throttleTime, map, filter } from "rxjs/operators";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";
import { EventInfo } from "../shared/models/event";
import { ReminderService } from "../shared/services/reminder.service";
import { ModalController } from "@ionic/angular";
import { EventDisplayComponent } from "../shared/components/event-display/event-display.component";
import { DeviceService } from "../shared/services/device.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
  // encapsulation:ViewEncapsulation.None
})
export class HomePage implements OnInit, AfterViewInit, OnInit {
  user: User;
  patient: User;
  drawerOptions: any;
  sendToDevice$: BehaviorSubject<EventInfo> = new BehaviorSubject(null);
  constructor(
    private push: PushNotificationsService,
    public userService: UserService,
    private themeService: ThemeService,
    private router: Router,
    private mapService: LocationService,
    private geolocation: Geolocation,
    private localNotifications: LocalNotifications,
    private reminder: ReminderService,
    private modalController: ModalController,
    private deviceService: DeviceService
  ) {
    this.user = this.userService.currentUserObj();
    this.drawerOptions = {
      handleHeight: 50,
      thresholdFromBottom: 200,
      thresholdFromTop: 200,
      bounceBack: true
    };
  }

  ngAfterViewInit(): void {
    if (this.user.Role === UserRole.Patient) {
      this.startWatchingEvents();
      // update local events
      // this.userService.getEventToNotify(user.Uid).subscribe(events => {
      //   console.log("Local notification creation");
      //   console.log(events);
      //   // console.log(this.localNotifications.g)
      //   let notifications = [];
      //   events.forEach((event: EventInfo, i) => {
      //     let notification = {
      //       id: event.EventDate,
      //       icon: "file://assets/logo.png",
      //       title: event.Title,
      //       text: event.Description,
      //       sound: "file://assets/alarm.mp3",
      //       trigger: { at: event.EventDate - (1000 * 5 * 60) }
      //     };
      //     notifications.push(notification);
      //   });
      //   if (notifications.length > 0) this.localNotifications.schedule(notifications);
      // });
      // update geolocation
      this.geolocation
        .watchPosition()
        .pipe(throttleTime(5000))
        .subscribe(data => {
          console.log("Geolocation Data");
          console.log(data);
          // data can be a set of coordinates, or an error (if an error occurred).
          // data.coords.latitude
          // data.coords.longitude
          let latLng = { lat: data.coords.latitude, lng: data.coords.longitude };
          this.userService
            .updateDoc({ Id: this.user.Uid, CurrentLatLng: JSON.stringify(latLng), LatLngTimestamp: data.timestamp }, this.user.Uid)
            .then(() => {
              console.log("GeoLocation updated Successfully");
              console.log(latLng);
            })
            .catch(err => {
              console.log("GeoLocation update failed");
              console.log(err);
            });
        });
    }
  }

  async ngOnInit() {
    // To update the user property with the latest changes
    this.userService.currentUser$.subscribe(res => {
      this.user = res;
      console.log(this.user);
    });

    if (this.user.Role === UserRole.Patient) {
      this.startWatchingEvents();
    }
    this.localNotifications.getAll().then(res => {
      console.log("GET ALL LOCAL NOTIFICATIONS");
      console.log(res);
    });

    this.sendToDevice$
      .pipe(
        throttleTime(2000),
        filter(x => !!x && x.Id !== this.reminder.stoppedEventId)
      )
      .subscribe(res => {
        this.sendEventToDevice(res);
      });
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
  startWatchingEvents() {
    this.reminder.watchEvents(event => {
      //this.display(event);
      if (event) this.sendToDevice$.next(event);
      else {
        this.startWatchingEvents();
      }
    });
  }
  private sendEventToDevice(event) {
    this.deviceService.sendEvent(event).subscribe(res => {
      console.count("device event send");
      console.log(res);
      if (res["buttonStatus"]) {
        console.log("stopped");
        this.reminder.stop();
      }
    });
  }
  private async display(event) {
    const modal = await this.modalController.create({
      component: EventDisplayComponent,
      componentProps: { event: event }
    });
    modal.onWillDismiss().then(res => {
      this.reminder.stop();
      this.startWatchingEvents();
    });
    return await modal.present();
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
    if (this.user.Patient && this.user.Patient.Uid) {
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
