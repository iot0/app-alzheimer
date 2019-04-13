import { NgModule, APP_INITIALIZER } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy, Router } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ServiceWorkerModule, SwUpdate, SwPush } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule, AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreModule, AngularFirestore } from "@angular/fire/firestore";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { NgxMapModule } from "ngx-map";
import { SharedModule } from "./shared/shared.module";
import { HttpClientModule } from "@angular/common/http";
import { NativeAudio } from "@ionic-native/native-audio/ngx";
import { BackgroundMode } from "@ionic-native/background-mode/ngx";
import { Camera } from "@ionic-native/camera/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";
import { UserService } from "./shared/services/user.service";
import { FirestoreService } from "./shared/services/firestore.service";
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }),
    NgxMapModule.forRoot(environment.googleMapApiKey),
    AngularFireModule.initializeApp(environment.firebase, "app-alzheimer"),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireFunctionsModule,
    AngularFireAuthModule,
    SharedModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeAudio,
    BackgroundMode,
    Camera,
    Geolocation,
    LocalNotifications,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      deps: [UserService],
      useFactory: (config: UserService) => {
        return () => config.refreshUserDetails();
      },
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(update: SwUpdate, push: SwPush) {
    update.available.subscribe(() => {
      console.log("Update available");
    });

    push.messages.subscribe(msg => {
      console.log(msg);
    });
  }
}
