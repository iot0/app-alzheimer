import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { EventInfo } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  collectionName: string = "events";
  constructor(private firestoreService: FirestoreService) {}

  register(data: EventInfo) {
    return this.firestoreService.add(this.collectionName,data);
  } 

  get():any {
    return this.firestoreService.colWithIds$(this.collectionName,
      (q)=>{
        return q.limit(30).orderBy("CreatedAt",'desc')
      });
  }
}
