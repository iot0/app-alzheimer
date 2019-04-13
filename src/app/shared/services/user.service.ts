import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User, UserRole } from "../models/user";
import { map, tap, first } from "rxjs/operators";
import { AngularFirestoreCollection } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { FirestoreService } from "./firestore.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { EventInfo } from "../models/event";
import { Family } from "../models/family";

@Injectable({
  providedIn: "root"
})
export class UserService implements OnInit{
  
  collectionName: string = "Users";
  eventSubCollectionName: string = "Events";
  familySubCollectionName: string = "Families";
  localKey: string = "user";
  userSubject: BehaviorSubject<User> = new BehaviorSubject(null);

  currentUser$: Observable<User> = this.userSubject.asObservable();

  isLoggedIn$: Observable<boolean> = this.userSubject.asObservable().pipe(map(x => !!x));

  isCareTaker$: Observable<boolean> = this.currentUser$.pipe(
    map(x => {
      return x ? x.Role == UserRole.CareTaker : false;
    })
  );

  isPatient$: Observable<boolean> = this.userSubject.asObservable().pipe(
    map(x => {
      return x ? x.Role == UserRole.Patient : false;
    })
  );

  userCollection: AngularFirestoreCollection<User>;

  constructor(private firestoreService: FirestoreService, public afAuth: AngularFireAuth) {
    
  }

  ngOnInit(){
    
  }

  isAuthenticated(): boolean {
    if (this.userSubject.value) return true;
    return false;
  }

  currentUserObj(): User {
    return this.userSubject.value;
  }

  async register(user: User) {
    const res = await this.afAuth.auth.createUserWithEmailAndPassword(user.EmailId, user.Password);
    user.Uid = res.user.uid;
    this.firestoreService.set(`${this.collectionName}/${res.user.uid}`, user);
    return user;
  }

  async login(user: User) {
    const res = await this.afAuth.auth.signInWithEmailAndPassword(user.EmailId, user.Password);
    user.Uid = res.user.uid;

    // get user details

    let userDoc = await this.getUserDetailsAsAsync(user.Uid);

    window.localStorage[this.localKey] = JSON.stringify(userDoc);
    this.userSubject.next(userDoc);

    return userDoc;
  }

  async logOut() {
    const user = window.localStorage[this.localKey];
    if (user != null) await this.afAuth.auth.signOut();
    this.clearUserJwt();
  }

  clearUserJwt() {
    this.userSubject.next(null);
    window.localStorage.removeItem(this.localKey);
  }

  async getUserDetailsAsAsync(uid: string) {
    return await this.firestoreService
      .doc$<User>(`${this.collectionName}/${uid}`)
      .pipe(first())
      .toPromise();
  }
  getUserDetails(docId: string) {
    return this.firestoreService.docWithId$(`${this.collectionName}/${docId}`);
  }

  async refreshUserDetails() {
    const userString = window.localStorage[this.localKey];
    if (userString != null && userString != "" && userString != "undefined") {
      try {
        let user = JSON.parse(userString);
        if (user && user.Uid) {
          user = await this.getUserDetailsAsAsync(user.Uid);
          window.localStorage[this.localKey] = JSON.stringify(user);
          this.userSubject.next(user);
          return true;
        }
      } catch (err) {
        this.clearUserJwt();
        return false;
      }
    }
    this.clearUserJwt();
    return false;
  }

  updateDoc(updatedUser: User, docId: string) {
    return this.firestoreService.update(`${this.collectionName}/${docId}`, updatedUser);
  }

  addEvents(userId: string, data: EventInfo) {
    return this.firestoreService.add(`${this.collectionName}/${userId}/${this.eventSubCollectionName}`, data);
  }

  getEvents(userId: string) {
    return this.firestoreService.colWithIds$(`${this.collectionName}/${userId}/${this.eventSubCollectionName}`, q => {
      return q.limit(30).orderBy("EventDate", "desc");
    });
  }

  getEventToNotify(userId: string) {
    console.log(new Date().getUTCMilliseconds());
    console.log(new Date().getTime());
    return this.firestoreService.colWithIds$(`${this.collectionName}/${userId}/${this.eventSubCollectionName}`, q => {
      return (
        q
          .orderBy("EventDate", "asc")
          .where("EventDate", ">=", new Date().getTime())
          // .startAt(new Date().getTime())
          .limit(10)
      );
    });
  }

  getPastEvent(userId: string) {
    return this.firestoreService.colWithIds$(`${this.collectionName}/${userId}/${this.eventSubCollectionName}`, q => {
      return (
        q
          .orderBy("EventDate", "asc")
          .where("EventDate", "<", new Date().getTime())
          // .startAt(new Date().getTime())
          .limit(10)
      );
    });
  }

  async addFamily(userId: string, data: Family) {
    return await this.firestoreService.add(`${this.collectionName}/${userId}/${this.familySubCollectionName}`, data);
  }

  getFamilies(userId: string): any {
    return this.firestoreService.colWithIds$(`${this.collectionName}/${userId}/${this.familySubCollectionName}`, q => {
      return q.limit(30).orderBy("CreatedAt", "desc");
    });
  }

  getFamily(userId: string, familyId: string): any {
    return this.firestoreService.doc$(`${this.collectionName}/${userId}/${this.familySubCollectionName}/${familyId}`);
  }

  getEventsByCreatedBy(userId: string, createdById: string): any {
    return this.firestoreService.colWithIds$(`${this.collectionName}/${userId}/${this.eventSubCollectionName}`, q => {
      return q
        .where("CreatedBy.Uid", "==", createdById)
        .limit(30)
        .orderBy("EventDate", "desc");
    });
  }

  async connectDevice(patientId: string, ip: string) {
    return this.firestoreService.update<User>(`${this.collectionName}/${patientId}`, { DeviceIp: ip });
  }
}
