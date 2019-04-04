import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserService } from "src/app/shared/services/user.service";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { User, UserRole } from "../../shared/models/user";

@Component({
  selector: "app-patient-form",
  templateUrl: "./patient-form.component.html",
  styleUrls: ["./patient-form.component.scss"]
})
export class PatientFormComponent implements OnInit {
  createForm: FormGroup;
  @Input("careTakerId")
  careTakerId: string;
  constructor(private fb: FormBuilder, private themeService: ThemeService, private userService: UserService) {
    this.createForm = this.fb.group({
      emailId: ["", Validators.required],
      password: ["", Validators.required],
      fullName: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      latLng: ["", Validators.required],
      address: ["", Validators.required]
    });
  }

  ngOnInit() {}

  onLocationSelect(location) {
    if (location) {
      this.createForm.get("latLng").setValue(JSON.stringify(location));
    }
  }

  prepareSaveInfo(): User {
    const formModel = this.createForm.value;
    let user: User = {
      FullName: formModel.fullName,
      EmailId: formModel.emailId,
      Role: UserRole.Patient,
      Password: formModel.password,
      Address: formModel.address,
      LatLng: formModel.latLng as string,
      PhoneNumber: formModel.phoneNumber as string
    };
    return user;
  }

  async onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid && this.careTakerId) {
      this.themeService.progress(true);

      let data = this.prepareSaveInfo();
      let patient;
      try {
        patient = await this.userService.register(data);
      } catch (err) {
        console.log(err);
        this.themeService.alert("Error", "Error adding this patient .");
        return;
      }

      let careTaker: User = { PatientId: patient.Uid, Id: this.careTakerId };

      this.userService
        .updateDoc(careTaker, this.careTakerId)
        .then(res => {
          this.themeService.alert("Success", "Patient added successfully");
        })
        .catch(err => {
          this.themeService.alert("Error", "Not able to add this Patient .");
        })
        .finally(() => {
          this.themeService.progress(false);
        });
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
