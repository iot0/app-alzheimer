import { Directive, Output, EventEmitter, HostListener, Input } from "@angular/core";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { ActionSheetController } from "@ionic/angular";

@Directive({
  selector: "[appFireImage]"
})
export class FireImageDirective {
  @Output("onSuccess")
  onSuccess: EventEmitter<any> = new EventEmitter();
  @Output("onError")
  onError: EventEmitter<any> = new EventEmitter();

  constructor(private camera: Camera, 
    public actionSheetCtrl: ActionSheetController) {}

  @HostListener("click")
  async onAddImage() {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: false,
      targetWidth: 600,
      targetHeight: 600,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Select Image From",
      buttons: [
        {
          text: "Camera",
          icon: "camera",
          handler: () => {
            options.sourceType = this.camera.PictureSourceType.CAMERA;
            this.takePhoto(options);
          }
        },
        {
          text: "Gallery",
          icon: "images",
          handler: () => {
            options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
            this.takePhoto(options);
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          }
        }
      ]
    });
    await actionSheet.present();
  }

  //TODO:// To take photos
  takePhoto(options: CameraOptions) {
    this.camera.getPicture(options).then(
      imageData => {
        let base64 = "data:image/jpeg;base64," + imageData;
        this.onSuccess.emit(base64);
      },
      err => {
        this.onError.emit(err);
        console.log(err);
      }
    );
  }
}
