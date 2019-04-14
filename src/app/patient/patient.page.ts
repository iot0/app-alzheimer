import { Component, OnInit } from "@angular/core";
import { User, UserRole } from "../shared/models/user";
import { UserService } from "../shared/services/user.service";
import { first, catchError, tap } from "rxjs/operators";
import { ThemeService } from "../shared/theme/theme.service";
import { FormMode } from "../shared/models/form";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-patient",
  templateUrl: "./patient.page.html",
  styleUrls: ["./patient.page.scss"]
})
export class PatientPage implements OnInit {
  currentUser: User;
  isPatientAdded: boolean = false;
  mode: FormMode = "existing";
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });

  constructor(private route: ActivatedRoute, private router: Router, public userService: UserService, private themeService: ThemeService) {
    this.currentUser = this.userService.currentUserObj();
  }

  async ngOnInit() {
    let param = await this.route.params.pipe(first()).toPromise();
    console.log(param);
    if (param.id && param.id != "undefined" && param.edit) {
      // loading patient details
      await this.loadDetails(param.id);
      this.mode = "edit";
    } else if (param.id && param.id != "undefined") {
      this.loadDetails(param.id);
      this.mode = "existing";
    } else {
      this.mode = "new";
    }
  }

  async loadDetails(patientId: string) {
    return await this.userService
      .getUserDetails(patientId)
      .pipe(
        catchError(err => {
          console.log(err);
          this.data$.next({ error: true });
          return err;
        }),
        first(),
        tap(res => {
          if (res) {
            this.isPatientAdded = true;
            this.data$.next({ data: res });
          } else this.data$.next({ empty: true });
        })
      )
      .toPromise();
  }
  afterRegistration(uid: string) {
    console.log(`After registration ${uid}`);
    this.router.navigate([`/patient/${uid}`]);
  }

  onEdit() {
    let patient: User = this.data$.value.data;
    this.router.navigate([`/patient/edit/${patient.Uid}`]);
  }
  onCancel() {
    let patient: User = this.data$.value.data;
    this.router.navigate([`/patient/${patient.Uid}`]);
  }
  goToFamilies() {
    if (this.currentUser.Role === UserRole.CareTaker) {
      this.router.navigate([`/families/${this.currentUser.Patient.Uid}`]);
    } else {
      this.router.navigate([`/families/${this.currentUser.Uid}`]);
    }
  }
}
