import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { ModalController } from "@ionic/angular";
import { UserService } from "src/app/shared/services/user.service";
import { Family } from "src/app/shared/models/family";
import { finalize } from "rxjs/operators";
import { AngularFireUploadTask, AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: "app-family-form",
  templateUrl: "./family-form.component.html",
  styleUrls: ["./family-form.component.scss"]
})
export class FamilyFormComponent implements OnInit {
  createForm: FormGroup;
  todaysDate: string = new Date().toISOString();

  @Input()
  patientId: string;

  @Output("success")
  onSuccess: EventEmitter<Family> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    public modalController: ModalController,
    private userService: UserService,
    private storage: AngularFireStorage
  ) {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.createForm = this.fb.group({
      fullName: ["", Validators.required],
      dob: ["", Validators.required],
      emailId: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      latLng: ["", Validators.required],
      address: ["", Validators.required],
      relation: ["", Validators.required],
      imagePath: ["", Validators.required]
    });
  }

  onClose() {
    this.modalController.dismiss();
  }

  onLocationSelect(location) {
    if (location) {
      this.createForm.get("latLng").setValue(JSON.stringify(location));
    }
  }
  async onImageSelect(e: AngularFireUploadTask) {
    await this.themeService.progress(true);
    e.then(
      res => {
        this.themeService.progress(false);
        this.themeService.toast("Image uploaded successfully .");
        if (res) {
          this.createForm.get("imagePath").setValue(res.ref.fullPath);
          console.log(res);
          e.snapshotChanges()
            .pipe(
              finalize(() => {
                this.storage
                  .ref(res.ref.fullPath)
                  .getDownloadURL()
                  .subscribe(res => {
                    this.createForm.get("imagePath").setValue(res);
                  });
              })
            )
            .subscribe();
        }
      },
      err => {
        console.log(err);
        this.themeService.toast("Sorry something went wrong .");
        this.themeService.progress(false);
      }
    ).catch(err => {
      console.log(err);
      this.themeService.toast("Sorry something went wrong .");
      this.themeService.progress(false);
    });
  }
  onImageError(e) {
    console.log(e);
    this.themeService.toast("Sorry something went wrong .");
  }
  prepareSaveInfo(): Family {
    const formModel = this.createForm.value;
    let user: Family = {
      FullName: formModel.fullName,
      DOB: formModel.dob,
      EmailId: formModel.emailId,
      PhoneNumber: formModel.phoneNumber,
      LatLng: formModel.latLng,
      Address: formModel.address,
      Relation: formModel.relation,
      ImagePath: formModel.imagePath as string
    };
    return user;
  }

  async onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid && this.patientId) {
      await this.themeService.progress(true);
      let data = this.prepareSaveInfo();
      try {
        let res: any = await this.userService.addFamily(this.patientId, data);
        console.log(res);
        this.onSuccess.emit(res.id);
        this.themeService.alert("Success", "Family registration successful");
      } catch (err) {
        console.log(err);
        await this.themeService.progress(false);
        await this.themeService.alert("Error", "Sorry something went wrong .");
      } finally {
        await this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
