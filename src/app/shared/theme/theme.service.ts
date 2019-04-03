import { Injectable } from "@angular/core";
import {
  LoadingController,
  ToastController,
  AlertController
} from "@ionic/angular";

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  loading;
  constructor(
    public loadingController: LoadingController,
    public toastController: ToastController,
    public alertController: AlertController
  ) {}

  async progress(show) {
    if (show) {
      this.loading = await this.loadingController.create();
      return await this.loading.present();
    } else if (this.loading) {
      return await this.loading.dismiss();
    }
  }

  async toast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async alert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message
    });
    alert.present();
  }
}
