import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { timer, throwError } from "rxjs";
import { switchMap, share, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DeviceService {
  constructor(private http: HttpClient) {}

  sync(ip: string) {
    return timer(0, 2000).pipe(
      switchMap(x => {
        return this.http.get(`http://${ip}/status`);
      }),
      share(),
      catchError(err => {
        console.log(err);
        // throwError(err);
        return err;
      })
    );
  }
}
