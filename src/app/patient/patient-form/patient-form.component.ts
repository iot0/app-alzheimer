import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserService } from "src/app/shared/services/user.service";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { User, UserRole } from "../../shared/models/user";
import { Router } from "@angular/router";
import { FormMode } from "src/app/shared/models/form";

@Component({
  selector: "app-patient-form",
  templateUrl: "./patient-form.component.html",
  styleUrls: ["./patient-form.component.scss"]
})
export class PatientFormComponent implements OnInit, OnChanges {
  createForm: FormGroup;
  user:User;
  @Input("data")
  data: User;
  @Input("mode")
  mode: FormMode = "new"; // can have values edit or new

  @Output()
  onSuccess: EventEmitter<string> = new EventEmitter();

  constructor(private fb: FormBuilder, private themeService: ThemeService, private userService: UserService, private router: Router) {
    this.initForm();
  }

  ngOnInit() {
    this.user=this.userService.currentUserObj();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["mode"]) {
      const mode: FormMode = changes["mode"].currentValue;

      this.createForm.reset();

      if (mode === "edit") {
        this.patchForm(this.data);
      }
    }
  }

  initForm() {
    this.createForm = this.fb.group({
      emailId: ["", Validators.required],
      password: ["", Validators.required],
      fullName: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      latLng: ["", Validators.required],
      address: ["", Validators.required]
    });
  }

  patchForm(data: User) {
    this.createForm.patchValue({
      fullName: data.FullName,
      phoneNumber: data.PhoneNumber,
      latLng: data.HomeLatLng,
      address: data.Address,
      emailId:data.EmailId,
      password:"password"
    });

    this.createForm.get("emailId").disable();
    this.createForm.get("password").disable();
  }
  onLocationSelect(location) {
    if (location) {
      this.createForm.get("latLng").setValue(JSON.stringify(location));
    }
  }

  prepareSaveInfo(): User {
    const formModel = this.createForm.value;
    if (this.mode === "new") {
      return {
        FullName: formModel.fullName,
        EmailId: formModel.emailId,
        Role: UserRole.Patient,
        Password: formModel.password,
        Address: formModel.address,
        HomeLatLng: formModel.latLng as string,
        PhoneNumber: formModel.phoneNumber as string
      };
    } else {
      return {
        FullName: formModel.fullName,
        Address: formModel.address,
        HomeLatLng: formModel.latLng as string,
        PhoneNumber: formModel.phoneNumber as string
      };
    }
  }

  async onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid && this.user) {
      this.themeService.progress(true);

      let data = this.prepareSaveInfo();
      try {
        if (this.mode === "new") {
          let patient = await this.userService.register(data);

          let careTaker: User = { Patient:{Uid:patient.Uid,FullName:patient.FullName}, Id: this.user.Uid };

          let updateRes = await this.userService.updateDoc(careTaker, this.user.Uid);

          this.themeService.alert("Success", "Patient registered successfully .");
          this.onSuccess.emit(patient.Uid);
        } else {

          let updateRes = await this.userService.updateDoc(data, this.data.Uid);
          this.themeService.alert("Success", "Patient updated successfully .");
          this.onSuccess.emit(this.data.Uid);
        }
      } catch (err) {
        console.log(err);
        this.themeService.alert("Error", "Error saving this patient .");
        return;
      } finally {
        this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
