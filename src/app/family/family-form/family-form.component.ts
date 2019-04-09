import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from 'src/app/shared/theme/theme.service';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/shared/services/user.service';
import { Family } from 'src/app/shared/models/family';

@Component({
  selector: 'app-family-form',
  templateUrl: './family-form.component.html',
  styleUrls: ['./family-form.component.scss'],
})
export class FamilyFormComponent implements OnInit {

  createForm: FormGroup;
  todaysDate: string = new Date().toISOString();

  @Input()
  patientId:string;

  @Output("success")
  onSuccess: EventEmitter<Family> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    public modalController: ModalController,
    private userService: UserService
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
      relation: ["", Validators.required]
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

  prepareSaveInfo(): Family {
    const formModel = this.createForm.value;
    let user: Family = {
      FullName: formModel.fullName,
      DOB: formModel.dob,
      EmailId: formModel.emailId,
      PhoneNumber: formModel.phoneNumber,
      LatLng: formModel.latLng,
      Address: formModel.address,
      Relation:formModel.relation
    };
    return user;
  }

  async onSubmit() {
    console.log(this.createForm);
    if (this.createForm.valid && this.patientId) {
      await this.themeService.progress(true);
      let data = this.prepareSaveInfo();
      try{
      let res:any=await this.userService.addFamily(this.patientId,data);
      console.log(res);
      this.onSuccess.emit(res.id);
      this.themeService.alert("Success", "Family registration successful");
      }
      catch(err){
        console.log(err);
        await this.themeService.progress(false);
        await this.themeService.alert("Error", "Sorry something went wrong .");
      }
      finally{
        await this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }

}
