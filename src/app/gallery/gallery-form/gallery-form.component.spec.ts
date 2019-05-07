import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryFormPage } from './gallery-form.page';

describe('GalleryFormPage', () => {
  let component: GalleryFormPage;
  let fixture: ComponentFixture<GalleryFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
