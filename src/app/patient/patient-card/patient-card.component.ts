import { Component, OnInit, Input } from "@angular/core";
import { User } from "src/app/shared/models/user";

@Component({
  selector: "app-patient-card",
  templateUrl: "./patient-card.component.html",
  styleUrls: ["./patient-card.component.scss"]
})
export class PatientCardComponent implements OnInit {
  @Input("data")
  user: User;
  constructor() {}

  ngOnInit() {}
}
