import { Component, OnInit, Input } from "@angular/core";
import { DrawerComponent } from "../drawer/drawer.component";
import { DeviceService } from "../../services/device.service";
import { ThemeService } from "../../theme/theme.service";
import { catchError, switchMap, tap } from "rxjs/operators";
import { of, timer, Subscription } from "rxjs";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user";
import { HttpClient } from "@angular/common/http";
import { NativeRingtones } from '@ionic-native/native-ringtones/ngx';

export type ConnectionStatus = "connecting" | "pendingSetup" | "connected" | "error" | "updateSetup";
@Component({
  selector: "app-device-connect",
  templateUrl: "./device-connect.component.html",
  styleUrls: ["./device-connect.component.scss"]
})
export class DeviceConnectComponent implements OnInit {
  @Input("drawer")
  drawer: DrawerComponent;
  deviceData;
  isOpened: boolean;
  user: User;
  connectionStatus: ConnectionStatus = "connecting";
  timerSubscription: Subscription;
  deviceIp: string;
  constructor(
    private deviceService: DeviceService,
    private http: HttpClient,
    private userService: UserService,
    private themeService: ThemeService,
    private ringtones: NativeRingtones
  ) {}

  ngOnInit() {
    this.user = this.userService.currentUserObj();
    this.userService.getUserDetails(this.user.Uid).subscribe(data => {
      console.log(data);
      this.user = data;
      if (this.user.DeviceIp) {
        this.onSync(this.user.DeviceIp);
      } else {
        this.connectionStatus = "pendingSetup";
      }
    });
    if (this.drawer) {
      this.drawer.onChange.subscribe(change => {
        this.onDrawerStateChange(change);
      });
    }
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
  async onDeviceConnect(ip) {
    if (ip) {
      await this.userService.connectDevice(this.user.Uid, ip);
    } else {
      this.themeService.alert("Error", "Invalid ip provided :(");
    }
  }
  onSync(ip) {
    this.connectionStatus = "connecting";
    if (this.timerSubscription) this.timerSubscription.unsubscribe();

    this.timerSubscription = timer(0, 2000)
      .pipe(
        switchMap(x => {
          return this.http.get(`http://${ip}/status`);
        }),
        tap(res => {
          console.log(res);
          this.deviceData = res;
          this.connectionStatus = "connected";
          if(res && res["buttonStatus"]){
            this.ringPhone();
          }
        }),
        catchError(err => {
          console.log(err);
          // throwError(err);
          console.log(err);
          this.connectionStatus = "error";
          return of(err);
        })
      )
      .subscribe();
  }
  getStatusColor() {
    switch (this.connectionStatus) {
      case "connecting":
        return "warning";
      case "connected":
        return "success";
      case "error":
        return "danger";
      case "pendingSetup":
      case "updateSetup":
        return "light";
    }
  }

  onUpdateDeviceConnection() {
    this.connectionStatus = "updateSetup";
  }
  onRefresh() {
    this.onSync(this.user.DeviceIp);
  }

  ringPhone(){
    this.ringtones.getRingtone().then((ringtones) => { console.log(ringtones); });
  }
}
