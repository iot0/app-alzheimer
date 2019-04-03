import { Component, OnInit, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { EventCreateModalComponent } from "./create-modal/event-create-modal.component";
import { EventsService } from "../shared/services/events.service";
import { catchError, takeUntil, takeWhile } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-events",
  templateUrl: "./events.page.html",
  styleUrls: ["./events.page.scss"]
})
export class EventsPage implements OnInit, OnDestroy {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  constructor(public modalController: ModalController, private eventsService: EventsService) {}

  ngOnInit() {
    this.eventsService
      .get()
      .pipe(
        catchError(err => {
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
