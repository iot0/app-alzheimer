import { Component, OnInit } from "@angular/core";
import { EventInfo } from "../../models/event";
import { ReminderService } from "../../services/reminder.service";
import { ModalController } from '@ionic/angular';
import { toBrowserTime } from '../../helper';

@Component({
  selector: "app-event-display",
  templateUrl: "./event-display.component.html",
  styleUrls: ["./event-display.component.scss"]
})
export class EventDisplayComponent implements OnInit {
  event: EventInfo;
  constructor(private reminder: ReminderService,private modalController:ModalController) {}

  ngOnInit() {}

  onClose() {
    this.modalController.dismiss();
    this.reminder.stop();
  }
  newDate(date) {
    return toBrowserTime(date);
  }
}
