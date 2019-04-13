import { Component, OnInit, Input, OnDestroy, AfterViewInit } from "@angular/core";
import { DrawerComponent } from "../drawer/drawer.component";
import { DeviceService } from "../../services/device.service";
import { ThemeService } from "../../theme/theme.service";
import {
  catchError,
  switchMap,
  tap,
  map,
  takeUntil,
  filter,
  takeWhile,
  delay,
  throttleTime,
  timeout,
  distinctUntilChanged
} from "rxjs/operators";
import { of, timer, Subscription, BehaviorSubject, Observable } from "rxjs";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user";
import { HttpClient } from "@angular/common/http";
import { Platform } from "@ionic/angular";
import { AudioService } from "../../services/audio.service";

export type ConnectionStatus = "connecting" | "pendingSetup" | "connected" | "error" | "updateSetup" | "alarm";
@Component({
  selector: "app-device-connect",
  templateUrl: "./device-connect.component.html",
  styleUrls: ["./device-connect.component.scss"]
})
export class DeviceConnectComponent implements OnInit, OnDestroy, AfterViewInit {
  ngOnDestroy(): void {
    this.alive = false;
  }
  @Input("drawer")
  drawer: DrawerComponent;
  deviceData;
  isOpened: boolean;
  user: User;
  alive: boolean = true;
  connecting: ConnectionStatus = "connecting";
  connectionStatus$: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(this.connecting);
  ringPhone$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  uiStatus$: Observable<any> = this.connectionStatus$.asObservable().pipe(map(x => this.getUIValues(x)));

  timerSubscription: Subscription;
  deviceIp: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private themeService: ThemeService,
    private device: DeviceService,
    private platform: Platform,
    private audioService: AudioService
  ) {}

  ngAfterViewInit(): void {
    this.audioService.preload("alarm", "assets/alarm.mp3");
  }

  ngOnInit() {
    this.ringPhone$
      .pipe(
        tap(() => {}),
        filter(() => this.connectionStatus$.value === "alarm"),
        distinctUntilChanged()
      )
      .subscribe(res => {
        if (res) {
          console.log("Ringing ...");
          this.ringPhone();
          this.drawer.openDrawer();
        } else {
          this.drawer.closeDrawer();
          console.log("Stop Ringing ...");
          this.onStopRinging();
        }
      });

    this.user = this.userService.currentUserObj();
    this.userService
      .getUserDetails(this.user.Uid)
      .pipe(
        takeWhile(() => this.alive),
        throttleTime(1000)
      )
      .subscribe(data => {
        console.log(data);
        this.user = data;
        if (this.user.DeviceIp) {
          this.onSync(this.user.DeviceIp);
        } else {
          this.connectionStatus$.next("pendingSetup");
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
      this.connectionStatus$.next("connecting");
      await this.userService.connectDevice(this.user.Uid, ip);
    } else {
      this.themeService.alert("Error", "Invalid ip provided :(");
    }
  }
  onSync(ip) {
    this.connectionStatus$.next("connecting");
    if (this.timerSubscription) this.timerSubscription.unsubscribe();

    this.timerSubscription = timer(0, 2000)
      .pipe(
        switchMap(x => {
          return this.device.sync(ip);
        }),
        timeout(5000),
        takeUntil(this.connectionStatus$.pipe(filter(x => x === "alarm" || x === "pendingSetup" || x === "updateSetup"))),
        tap(res => {
          console.log(res);
          if (res && res["buttonStatus"] && !res["eventAlertStatus"]) {
            this.connectionStatus$.next("alarm");
            // this.checkForBgMode();
            this.ringPhone$.next(true);
          } else {
            this.connectionStatus$.next("connected");
          }
        }),
        catchError(err => {
          console.log(err);
          this.connectionStatus$.next("error");
          return of(err);
        })
      )
      .subscribe();
  }

  getUIValues(status) {
    let value;
    switch (status) {
      case "connecting":
        value = {
          color: "primary",
          icon: "logo-rss",
          title: "Connecting ..."
        };
        break;
      case "connected":
        value = {
          color: "success",
          icon: "checkmark-circle",
          title: "Connected"
        };
        break;
      case "alarm":
        value = {
          color: "tertiary",
          icon: "musical-note",
          title: "Thank God You Found Me :) "
        };
        break;
      case "error":
        value = {
          color: "danger",
          icon: "alert",
          title: "Connection Failed"
        };
        break;
      case "pendingSetup":
      case "updateSetup":
        value = {
          color: "secondary",
          icon: "pulse",
          title: "Device Setup"
        };
        break;
    }
    value.status = status;
    return value;
  }

  onUpdateDeviceConnection() {
    this.connectionStatus$.next("updateSetup");
  }
  onRefresh() {
    this.onSync(this.user.DeviceIp);
  }

  checkForBgMode() {}

  stopRinging() {
    this.ringPhone$.next(false);
  }

  ringPhone() {
    console.log("Ring phone");
    this.audioService.play("alarm");
  }

  onStopRinging() {
    console.log("Stop Ring phone");
    this.audioService.stop("alarm");
    this.device.resetButtonStatus().subscribe(() => {
      this.onSync(this.user.DeviceIp);
    });
  }
}
