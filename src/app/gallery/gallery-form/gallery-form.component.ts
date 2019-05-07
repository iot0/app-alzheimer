import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ThemeService } from "src/app/shared/theme/theme.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/shared/services/user.service";
import { FireStorageService } from 'src/app/shared/services/fire-storage.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-gallery-form",
  templateUrl: "./gallery-form.component.html",
  styleUrls: ["./gallery-form.component.scss"]
})
export class GalleryFormComponent implements OnInit {
  createForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    public modalController: ModalController,
    private userService: UserService,
    private storage: FireStorageService
  ) {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.createForm = this.fb.group({
      caption: ["", Validators.required],
      imagePath: ["", Validators.required]
    });
  }

  onClose() {
    this.modalController.dismiss();
  }
  prepareSaveInfo() {
    const formModel = this.createForm.value;
    let data = {
      Caption: formModel.caption,
      ImagePath: formModel.imagePath
    };
    return data;
  }

  async onSubmit() {
    if (this.createForm.valid) {
      this.themeService.progress(true);
      let data = this.prepareSaveInfo();

      try {
        let res = await this.userService.addToGallery(data);
        this.themeService.alert("Success", "Added to Gallery successfully");
        this.onClose();
      } catch (err) {
        console.log(err);
        await this.themeService.progress(false);
        this.themeService.alert("Error", "Sorry something went wrong :( .");
      } finally {
        this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }

  async onImageSelect(img) {
    await this.themeService.progress(true);
    let task = this.storage.uploadGalleryImage(img);
    task
      .then(
        res => {
          this.themeService.progress(false);
          this.themeService.toast("Image uploaded successfully .");
          if (res) {
            this.createForm.get("imagePath").setValue(res.ref.fullPath);
            console.log(res);
            task
              .snapshotChanges()
              .pipe(
                finalize(() => {
                  this.storage.getDownloadURL(res.ref.fullPath).subscribe(res => {
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
      )
      .catch(err => {
        console.log(err);
        this.themeService.toast("Sorry something went wrong .");
        this.themeService.progress(false);
      });
  }
  onImageError(e) {
    console.log(e);
    this.themeService.toast("Sorry something went wrong .");
  }
}
