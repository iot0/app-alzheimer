import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDrawerPage } from './event-drawer.page';

describe('EventDrawerPage', () => {
  let component: EventDrawerPage;
  let fixture: ComponentFixture<EventDrawerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventDrawerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDrawerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
