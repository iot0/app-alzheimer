import { Component, AfterViewInit } from "@angular/core";
import { PushNotificationsService } from "../shared/services/push-notifications.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { UserService } from "../shared/services/user.service";
import { ThemeService } from "../shared/theme/theme.service";
import { User } from "../shared/models/user";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements AfterViewInit {
  constructor(
    private push: PushNotificationsService,
    public userService: UserService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {}

  async onLogOut() {
    await this.themeService.progress(true);
    try {
      await this.userService.logOut();
      this.router.navigate(["welcome"]);
    } catch (err) {
      console.dir(err);
      await this.themeService.toast(err.message);
    } finally {
      await this.themeService.progress(false);
    }
  }
}
