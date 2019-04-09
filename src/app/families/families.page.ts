import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserService } from "../shared/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { ThemeService } from "../shared/theme/theme.service";
import { catchError, takeWhile } from "rxjs/operators";

@Component({
  selector: "app-families",
  templateUrl: "./families.page.html",
  styleUrls: ["./families.page.scss"]
})
export class FamiliesPage implements OnInit {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  patientId:string;
  constructor(public userService: UserService, private route: ActivatedRoute, private themeService: ThemeService) {
    this.route.params.subscribe(param => {
      console.log(param);
      if (param.pid && param.pid != "") {
        this.patientId=param.pid;
        // loading  details
        this.loadDetails(param.pid);
      } else {
        this.themeService.alert("Error", "Invalid parameter error :( ");
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  loadDetails(patientId?: string) {
    this.userService
      .getFamilies(patientId)
      .pipe(
        catchError(err => {
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe(res => {
        console.log(res);
        if (res && res.length > 0) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
      });
  }
}
