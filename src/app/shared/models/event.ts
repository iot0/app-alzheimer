import { User } from './user';

export class EventInfo {
   Id?:number; 
   Title:string;
   EventDate:Date;
   IsLocationEvent:boolean;
   LatLng?:string;
   Address?:string;
   Description:string;
   CreatedBy?:User;
}