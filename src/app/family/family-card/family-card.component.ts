import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-family-card',
  templateUrl: './family-card.component.html',
  styleUrls: ['./family-card.component.scss'],
})
export class FamilyCardComponent implements OnInit {
  @Input("data") data;
  constructor() { }

  ngOnInit() {}
  
  calculateAge(date) {
    let yearDiff = new Date().getFullYear() - new Date(date).getFullYear();
    return yearDiff;
  }
}
