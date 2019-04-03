import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ThemeService } from '../theme/theme.service';
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  token;
  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    public themeService: ThemeService
  ) {
    this.angularFireMessaging.messaging.subscribe(_messaging => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    });
  }

  /**
   * update token in firebase database
   *
   * @param userId userId as a key
   * @param token token as a value
   */
  updateToken(token) {
    this.token = token;
    // we can change this function to request our backend service
    // const user = this.userService.userSubject.value;
    // console.log(user);
    // this.userService.updateDoc({ ...user, DeviceToken: token }, user.Id);
  }

  /**
   * request permission for notification from firebase cloud messaging
   *
   * @param userId userId
   */
  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      token => {
        console.log(token);
        this.updateToken(token);
      },
      err => {
        console.error("Unable to get permission to notify.", err);
      }
    );
  }

  /**
   * hook method when new notification received in foreground
   */
  showMessages() {
    return this.angularFireMessaging.messages;
  }

  sub(topic) {
    this.fun
      .httpsCallable("subscribeToTopic")({ topic, token: this.token })
      .pipe(tap(_ => this.themeService.toast(`subscribed to ${topic}`)))
      .subscribe();
  }
}
