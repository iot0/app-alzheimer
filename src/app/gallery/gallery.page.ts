import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import { FireStorageService } from "../shared/services/fire-storage.service";
import { ThemeService } from "../shared/theme/theme.service";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"]
})
export class GalleryPage implements OnInit {
  @ViewChild("photoSwipe") photoSwipe: ElementRef;
  createForm: any;

  constructor(private storage: FireStorageService, private themeService: ThemeService) {}

  ngOnInit() {}
  async onImageSelect(img) {
    await this.themeService.progress(true);
    let task = this.storage.uploadGalleryImage(img);
    task
      .then(
        res => {
          this.themeService.progress(false);
          this.themeService.toast("Image uploaded successfully .");
          if (res) {
            // refresh images
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
  openGallery() {
    // Build gallery images array
    // build items array
    let items = [
      {
        src: "https://farm2.staticflickr.com/1043/5186867718_06b2e9e551_b.jpg",
        w: 964,
        h: 1024
      },
      {
        src: "https://farm7.staticflickr.com/6175/6176698785_7dee72237e_b.jpg",
        w: 1024,
        h: 683
      }
    ];

    // define options (if needed)
    let options = {
      // history & focus options are disabled on CodePen
      history: false,
      focus: false,

      showAnimationDuration: 0,
      hideAnimationDuration: 0
    };

    const gallery = new PhotoSwipe(this.photoSwipe.nativeElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }
}
