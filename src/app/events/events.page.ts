import { Component, OnInit, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { EventCreateModalComponent } from "./create-modal/event-create-modal.component";
import { catchError, takeUntil, takeWhile } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { UserService } from "../shared/services/user.service";
import { User, UserRole } from "../shared/models/user";

@Component({
  selector: "app-events",
  templateUrl: "./events.page.html",
  styleUrls: ["./events.page.scss"]
})
export class EventsPage implements OnInit, OnDestroy {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  user: User;
  constructor(public modalController: ModalController, private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.currentUserObj();
    this.loadEvents();
  }

  loadEvents() {
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
        if (res && res.length > 0) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
        console.log(res);
      });
  }

  async onEventCreate() {
    const modal = await this.modalController.create({
      component: EventCreateModalComponent
    });
    return await modal.present();
  }

  onEventSegmentChange($event) {
    console.log($event);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
