import { Component, OnInit } from "@angular/core";
import { FormMode } from "../shared/models/form";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../shared/services/user.service";
import { ThemeService } from "../shared/theme/theme.service";
import { User } from "../shared/models/user";
import { catchError } from "rxjs/operators";

@Component({
  selector: "app-family",
  templateUrl: "./family.page.html",
  styleUrls: ["./family.page.scss"]
})
export class FamilyPage implements OnInit {
  mode: FormMode = "existing";
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  patientId: string;
  constructor(private route: ActivatedRoute, private router: Router, public userService: UserService, private themeService: ThemeService) {}

  ngOnInit() {
    this.route.params.subscribe(param => {
      console.log(param);
      if (param.pid && param.pid != "undefined" && param.fid && param.fid != "undefined") {
        // loading patient details
        this.loadDetails(param.pid, param.fid);
      } else if (param.pid && param.pid != undefined) {
        this.patientId = param.pid;
        this.mode = "new";
      } else {
        this.themeService.alert("Error", "Invalid parameters provided :( ");
      }
    });
  }

  afterRegistration(id:string) {
    // console.log(data);
    // this.data$.next({ data: data });
    // this.mode = "existing";
    console.log(id);
    this.router.navigate([`/families/${this.patientId}`]);
  }

  loadDetails(patientId: string, familyId) {
    this.userService
      .getFamily(patientId, familyId)
      .pipe(
        catchError(err => {
          this.data$.next({ error: true });
          return err;
        })
      )
      .subscribe(res => {
        console.log(res);
        if (res) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
      });
  }
}
