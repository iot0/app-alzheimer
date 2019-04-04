import { Component, OnInit } from "@angular/core";
import { User } from "../shared/models/user";
import { UserService } from "../shared/services/user.service";

@Component({
  selector: "app-patient",
  templateUrl: "./patient.page.html",
  styleUrls: ["./patient.page.scss"]
})
export class PatientPage implements OnInit {
  currentUser: User;
  isPatientAdded: boolean = false;
  patient: User;
  constructor(private userService: UserService) {
    this.currentUser = this.userService.currentUserObj();
    console.log(this.currentUser);
    if (this.currentUser.PatientId) {
      this.isPatientAdded = true;
      this.userService.getById(this.currentUser.PatientId).subscribe(patient => {
        this.patient = patient;
        console.log(this.patient);
      });
    }
  }

  ngOnInit() {}
}
