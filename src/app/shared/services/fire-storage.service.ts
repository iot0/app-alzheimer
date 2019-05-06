import { Injectable } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";

@Injectable({
  providedIn: "root"
})
export class FireStorageService {
  patientFolder:string="patients";
  galleryFolder:string="gallery";
  constructor(private storage: AngularFireStorage) {}

  upload(folder, data, name: string = null) {
    let uniqkey = `${folder}/${name ? `${name}_` : ""}${Math.floor(Math.random() * 1000000)}`;
    let fileRef = this.storage.ref(uniqkey);
    const task = fileRef.putString(data, "data_url");
    // this.onSuccess.emit(task);//added for testing only
    return task;
  }
  uploadPatientImage(data){
    return this.upload(this.patientFolder,data);
  }
  uploadGalleryImage(data){
    return this.upload(this.galleryFolder,data);
  }
  getDownloadURL(fullPath){
    return this.storage.ref(fullPath).getDownloadURL();
  }
}
