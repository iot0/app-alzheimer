import { Directive, Output, EventEmitter, HostListener } from "@angular/core";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { ActionSheetController } from "@ionic/angular";
import { AngularFireStorage } from "@angular/fire/storage";

@Directive({
  selector: "[appFireImage]"
})
export class FireImageDirective {
  @Output("onSuccess")
  onSuccess: EventEmitter<any> = new EventEmitter();
  @Output("onError")
  onError: EventEmitter<any> = new EventEmitter();
  storageDir: string = "patients";

  constructor(private camera: Camera, public actionSheetCtrl: ActionSheetController, private storage: AngularFireStorage) {}

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
        this.onSuccess.emit(this.upload(base64));
      },
      err => {
        this.onError.emit(err);
        console.log(err);
      }
    );
  }
  upload(data, name: string = null) {
    try {
      let uniqkey = `${this.storageDir}/${name ? `${name}_` : ""}${Math.floor(Math.random() * 1000000)}`;
      let fileRef = this.storage.ref(uniqkey);
      const task = fileRef.putString(data, "data_url");

      // this.onSuccess.emit(task);//added for testing only
      return task;
    } catch (e) {
      console.log(e);
      this.onError.emit(e);
    }
  }
}
