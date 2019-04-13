import { Injectable } from "@angular/core";
import { EventInfo } from "../models/event";
import { Subscription, timer } from "rxjs";
import { UserService } from "./user.service";
import { UserRole } from "../models/user";
import { ThemeService } from "../theme/theme.service";
import { AudioService } from "./audio.service";
import { BackgroundMode } from "@ionic-native/background-mode/ngx";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";
import { takeWhile, takeUntil, filter } from "rxjs/operators";
import { pipe } from "@angular/core/src/render3";

@Injectable({
  providedIn: "root"
})
export class ReminderService {
  timerSubscription: Subscription;
  event: EventInfo;
  stoppedEventId: string;
  constructor(
    private userService: UserService,
    private audio: AudioService,
    private bgMode: BackgroundMode,
    private localNotifications: LocalNotifications
  ) {
    this.audio.preload("reminder", "/assets/alarm.mp3");
  }

  private start(event: EventInfo, cb) {
    this.event = event;
    if (this.timerSubscription) this.timerSubscription.unsubscribe();

    let user = this.userService.currentUserObj();
    this.timerSubscription = timer(0, 3000)
      .pipe(
        takeWhile(() => user.Role === UserRole.Patient),
        takeUntil(this.userService.isLoggedIn$.pipe(filter(x => !x)))
      )
      .subscribe(() => {
        if (!this.event) this.timerSubscription.unsubscribe();
        let now = new Date().getTime();
        console.log(new Date());
        console.log(new Date(this.event.EventDate));
        console.log(this.event.EventDate > now && this.event.EventDate <= now + 1000 * 10 * 60);
        if (this.event.EventDate > now && this.event.EventDate <= now + 1000 * 10 * 60 && this.stoppedEventId != this.event.Id) {
          console.log("less than 5 mins for this event");
          //this.audio.play("reminder");
          //this.notifyLocally(this.event);
          cb(this.event);
          //this.timerSubscription.unsubscribe();
        } else if (this.event.EventDate < now) {
          this.stop();
          cb(null);
        }
      });
  }

  watchEvents(cb: Function) {
    let user = this.userService.currentUserObj();
    this.userService
      .getEventToNotify(user.Uid)
      .pipe(takeWhile(() => user.Role === UserRole.Patient))
      .subscribe(events => {
        if (user.Role === UserRole.Patient) {
          let filteredEvents = events.filter(x => x.Id !== this.stoppedEventId);
          if (filteredEvents.length > 0) {
            this.start(filteredEvents[0], cb);
          }
        }
      });
  }
  stop() {
    this.timerSubscription.unsubscribe();
    this.stoppedEventId = this.event.Id;
    //this.audio.stop("reminder");
  }

  notifyLocally(event: EventInfo) {
    if (this.bgMode.isActive) {
      this.localNotifications.cancelAll().then(() => {
        let notification = {
          id: event.EventDate,
          icon: "file://assets/logo.png",
          title: event.Title,
          text: event.Description,
          sound: "file://assets/alarm.mp3"
        };
        this.localNotifications.schedule(notification);
      });
    }
  }
}
