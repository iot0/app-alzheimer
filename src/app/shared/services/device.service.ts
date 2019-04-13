import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { timer, throwError } from "rxjs";
import { switchMap, share, catchError } from "rxjs/operators";
import { EventInfo } from '../models/event';
import { toBrowserTime } from '../helper';

@Injectable({
  providedIn: "root"
})
export class DeviceService {
  ip: string;
  constructor(private http: HttpClient) {}

  sync(ip: string) {
    this.ip = ip;
    return this.http.get(`http://${ip}/status`);
  }

  resetButtonStatus() {
    return this.http.post(`http://${this.ip}/resetButton`, null);
  }

  sendEvent(event:EventInfo) {
    return this.http.post(`http://${this.ip}/updateEventAlert`, {eventAlert:`${event.Title} on ${new Date(toBrowserTime(event.EventDate)).toLocaleDateString()}`});
  }
}
