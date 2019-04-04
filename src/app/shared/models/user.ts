export class User {
  Id?:string;
  Uid?: string;
  FullName?: string;
  EmailId?: string;
  CreatedAt?:Date;
  Role?:UserRole;
  Password?:string;
  Address?:string;
  LatLng?:string;
  PhoneNumber?:string;
  PatientId?:string;
}
export enum UserRole{
    CareTaker=1,
    Patient,
}
