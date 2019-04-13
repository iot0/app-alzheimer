import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { ModalController, IonSegment, Platform } from "@ionic/angular";
import { EventCreateModalComponent } from "./create-modal/event-create-modal.component";
import { catchError, takeUntil, takeWhile } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { UserService } from "../shared/services/user.service";
import { User, UserRole } from "../shared/models/user";
import { toBrowserTime } from "../shared/helper";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";

@Component({
  selector: "app-events",
  templateUrl: "./events.page.html",
  styleUrls: ["./events.page.scss"]
})
export class EventsPage implements OnInit, OnDestroy {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  user: User;
  @ViewChild("segment") segment: IonSegment;
  constructor(
    public modalController: ModalController,
    private platform: Platform,
    private localNotifications: LocalNotifications,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.userService.currentUserObj();
    this.loadAllEvents();
  }

  loadAllEvents() {
    let service;
    if (this.user.Role == UserRole.CareTaker) {
      service = this.userService.getEventsByCreatedBy(this.user.Patient.Uid, this.user.Uid);
    } else {
      service = this.userService.getEvents(this.user.Uid);
    }

    service
      .pipe(
        catchError(err => {
          console.log(err);
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe(res => {
        if (res && res.length > 0) {
          this.data$.next({ data: res });
        } else this.data$.next({ empty: true });
        console.log(res);
      });
  }
  loadUpcomingEvents() {
    this.userService
      .getEventToNotify(this.user.Uid)
      .pipe(
        catchError(err => {
          console.log(err);
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.data$.next({ data: res });
        } else this.data$.next({ empty: true });
        console.log(res);
      });
  }
  async loadRegisteredEvents() {
    try {
      await this.platform.ready().then(async () => {
        let res = await this.localNotifications.getAllScheduled();
        console.log(res);
        if (res.length > 0) {
          this.data$.next({ data: res });
        } else {
          this.data$.next({ empty: true });
        }
      });
    } catch (err) {
      this.data$.next({ error: true });
    }
  }
  async onEventCreate() {
    const modal = await this.modalController.create({
      component: EventCreateModalComponent
    });
    return await modal.present();
  }

  onEventSegmentChange($event) {
    console.log($event);
    this.data$.next({ loading: true });
    if ($event && $event.detail.value === "registered") {
      // await this.loadRegisteredEvents();
      this.loadUpcomingEvents();
    } else {
      this.loadAllEvents();
    }
  }
  newDate(date) {
    return toBrowserTime(date);
  }
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  getImagePath(eventDate) {
    let image = "events.png";
    if (this.segment) {
      let todaysDate = new Date().getTime();
      switch (this.segment.value) {
        case "all":
          image = todaysDate > eventDate ? "past-event.png" : "upcoming-event.png";
          break;
        case "registered":
          image = "registered-event.png";
          break;
      }
    }
    return `/assets/${image}`;
  }
}
