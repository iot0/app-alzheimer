import { Component, OnInit } from "@angular/core";
import { User, UserRole } from "../shared/models/user";
import { UserService } from "../shared/services/user.service";
import { first, catchError } from "rxjs/operators";
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
  patient: User;
  mode: FormMode = "existing";
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private themeService: ThemeService) {
    this.currentUser = this.userService.currentUserObj();
  }

  async ngOnInit() {
    this.route.params.subscribe(param => {
      console.log(param);
      if (param.id && param.id != "undefined") {
        // loading patient details
        this.loadDetails(param.id);
      } else {
        this.mode = "new";
      }
    });
  }

  loadDetails(patientId: string) {
    this.userService
      .getUserDetails(patientId)
      .pipe(
        catchError(err => {
          console.log(err);
          this.data$.next({ error: true });
          return err;
        }),
        first()
      )
      .subscribe(res => {
        console.log(res);
        if (res) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
      });
  }
  afterRegistration(uid: string) {
    this.router.navigate([`/patient/${uid}`]);
  }
  onEdit() {
    this.mode = "edit";
  }

  goToFamilies() {
    if (this.currentUser.Role === UserRole.CareTaker) {
      this.router.navigate([`/families/${this.currentUser.Patient.Uid}`]);
    } else {
      this.router.navigate([`/families/${this.currentUser.Uid}`]);
    }
  }
  onCancel() {
    this.mode = "existing";
  }
}
