import { User } from './user';

export class EventInfo {
   Id?:string; 
   Title:string;
   EventDate:number;
   IsLocationEvent:boolean;
   LatLng?:string;
   Address?:string;
   Description:string;
   CreatedBy?:User;
   IsAcknowledged?:boolean;
}