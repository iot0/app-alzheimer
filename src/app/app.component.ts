import { Component, OnInit } from "@angular/core";

import { Platform, ModalController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { BackgroundMode } from "@ionic-native/background-mode/ngx";
import { UserService } from "./shared/services/user.service";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";
import { ThemeService } from './shared/theme/theme.service';
import { ReminderService } from './shared/services/reminder.service';
import { EventDisplayComponent } from './shared/components/event-display/event-display.component';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private bgMode: BackgroundMode,
    private userService: UserService,
    private localNotifications: LocalNotifications,
    private themeService:ThemeService,
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    
    this.localNotifications.on("trigger").subscribe(event => {
      console.log("LOCATION NOTIFICATION VENT TRIGGER");
      console.log(event);
    });
    this.localNotifications.on("click").subscribe(event => {
      console.log("LOCATION NOTIFICATION VENT TRIGGER");
      console.log(event);

      this.themeService.alert("Event Alert","Please check out the event section for more details .");
    });
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      console.log("Background MODE");
      this.bgMode.enable();

      console.log(this.bgMode.isEnabled());
    });
  }
}
