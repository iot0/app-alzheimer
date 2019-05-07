import { Component, OnInit, Input, AfterViewInit, OnDestroy } from "@angular/core";
import { DrawerComponent } from "../drawer/drawer.component";
import { BehaviorSubject, Subject, Observable, Subscription, timer } from "rxjs";
import { distinctUntilChanged, filter, tap, map, catchError, takeWhile, takeUntil } from "rxjs/operators";
import { AudioService } from "../../services/audio.service";
import { UserService } from "../../services/user.service";
import { User, UserRole } from "../../models/user";
import { toBrowserTime } from "../../helper";
import { EventInfo } from "../../models/event";
import { ModalController } from "@ionic/angular";

type EventType = "alarm" | "default";

interface EventAlertStatus {
  color?: string;
  icon?: string;
  title?: string;
  event: EventInfo;
  status: EventType;
}

@Component({
  selector: "app-event-drawer",
  templateUrl: "./event-drawer.component.html",
  styleUrls: ["./event-drawer.component.scss"]
})
export class EventDrawerComponent implements OnInit, AfterViewInit, OnDestroy {
  alertPeriod: number = (1000 * 60)*10; 
  @Input("drawer")
  drawer: DrawerComponent;
  isOpened: boolean;

  eventInfo$: BehaviorSubject<EventAlertStatus> = new BehaviorSubject(null);
  uiData$: Observable<EventAlertStatus> = this.eventInfo$.asObservable().pipe(map(x => this.getUIValues(x)));

  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  user: User;
  timerSubscription: Subscription;
  constructor(private audioService: AudioService, private modalController: ModalController, public userService: UserService) {}
  ngAfterViewInit(): void {
    this.audioService.preload("alarm", "assets/alarm.mp3");
  }
  ngOnInit() {
    this.user = this.userService.currentUserObj();
    this.eventInfo$
      .pipe(
        map(x=>x?x.status:null) ,
        distinctUntilChanged()
      )
      .subscribe(res => {
        if (res) {
          if (res == "alarm") {
            console.log("Ringing ...");
            this.ringPhone();
          } else if (res == "default") {
            console.log("Stop Ringing ...");
            this.onStopRinging();
          }
        }
      });
    if (this.drawer) {
      this.drawer.onChange.subscribe(change => {
        this.onDrawerStateChange(change);
      });
    }
    this.loadUpcomingEvents();
  }
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  newDate(date) {
    return toBrowserTime(date);
  }
  loadUpcomingEvents() {
    this.userService
      .getEventToNotify(this.user.Uid)
      .pipe(
        tap(x => {
          if (x && x.length > 0) {
            let events: EventInfo[] = x.filter(x => !x.IsAcknowledged);
            if (events.length > 0) {
              this.start(events[0], (event: EventInfo) => {
                this.eventInfo$.next({ event: event, status: "alarm" });
              });
            }
          }
        }),
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
  //TODO: To show arrow accordingly for customer popup
  onDrawerStateChange(change) {
    switch (change) {
      case "opened":
        this.isOpened = true;
        break;
      case "closed":
        this.isOpened = false;
        break;
    }
  }

  ringPhone() {
    console.log("Ring phone");
    this.audioService.play("alarm");
    this.drawer.openDrawer();
  }
  stopRinging() {
    if(this.timerSubscription) this.timerSubscription.unsubscribe();
    let event:EventInfo=this.eventInfo$.value.event;
    this.userService.acknowledgeEvent(event);
    this.eventInfo$.next({ event: null, status: "default" });
  }
  onStopRinging() {
    console.log("Stop Ring phone");
    this.audioService.stop("alarm");
  }
  getUIValues(eventInfo: EventAlertStatus) {
    let value: EventAlertStatus;
    if (eventInfo && eventInfo.status === "alarm") {
      value = {
        color: "tertiary",
        icon: "musical-note",
        title: "Event Alert",
        ...eventInfo
      };
    } else {
      value = {
        color: "secondary",
        icon: "pulse",
        title: "Upcoming Events",
        ...eventInfo
      };
    }
    return value;
  }
  getEventIcon(event: EventInfo) {
    if (event.IsAcknowledged) {
      return "volume-off";
    }
    return "calendar";
  }
  private start(event: EventInfo, cb) {
    let user = this.userService.currentUserObj();
    this.timerSubscription = timer(0, 3000)
      .pipe(
        takeWhile(() => !event.IsAcknowledged),
        takeWhile(() => user.Role === UserRole.Patient),
        takeUntil(this.userService.isLoggedIn$.pipe(filter(x => !x)))
      )
      .subscribe(() => {
        let now = new Date().getTime();
        console.log(new Date());
        console.log(new Date(event.EventDate));
        console.log(event.EventDate > now && event.EventDate <= now + this.alertPeriod);
        if (event.EventDate > now && event.EventDate <= now + this.alertPeriod) {
          console.log("less than 5 mins for this event");
          cb(event);
        } else if (event.EventDate < now) {
          cb(null);
        }
      });
  }
}
