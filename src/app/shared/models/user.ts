export class User {
  Id?:string;
  Uid?: string;
  FullName?: string;
  EmailId?: string;
  CreatedAt?:Date;
  Role?:UserRole;
  Password?:string;
  Address?:string;
  HomeLatLng?:string;
  CurrentLatLng?:string;
  LatLngTimestamp?:number;
  PhoneNumber?:string;
  Patient?:User;
  Relation?:string;
  DOB?:Date;
  DeviceIp?:string;
  ImagePath?:string;
}
export enum UserRole{
    CareTaker=1,
    Patient
}
