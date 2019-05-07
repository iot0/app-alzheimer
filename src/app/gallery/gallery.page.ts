import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FireStorageService } from "../shared/services/fire-storage.service";
import { ThemeService } from "../shared/theme/theme.service";
import { finalize, catchError, takeWhile } from "rxjs/operators";
import { ModalController } from "@ionic/angular";
import { GalleryFormComponent } from "./gallery-form/gallery-form.component";
import { UserService } from "../shared/services/user.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"]
})
export class GalleryPage implements OnInit {
  @ViewChild("photoSwipe") photoSwipe: ElementRef;
  createForm: any;
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  constructor(public modalController: ModalController, public userService: UserService, private themeService: ThemeService) {}

  ngOnInit() {
    this.loadAllGalleryImages();
  }

  async onAddToGallery() {
    let user = this.userService.currentUserObj();
    if (!user.Patient || !user.Patient.Uid) this.themeService.alert("Warning", "Please add patient first ");
    const modal = await this.modalController.create({
      component: GalleryFormComponent
    });
    return await modal.present();
  }

  loadAllGalleryImages() {
    this.data$.next({ loading: true });
    this.userService
      .getFromGallery()
      .pipe(
        catchError(err => {
          console.log(err);
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.data$.next({ data: res });
        } else this.data$.next({ empty: true });
        console.log(res);
      });
  }
}
