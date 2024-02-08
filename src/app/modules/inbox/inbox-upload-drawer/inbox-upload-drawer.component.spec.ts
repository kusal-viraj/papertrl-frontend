import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxUploadDrawerComponent } from './inbox-upload-drawer.component';

describe('InboxUploadDrawerComponent', () => {
  let component: InboxUploadDrawerComponent;
  let fixture: ComponentFixture<InboxUploadDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboxUploadDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboxUploadDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
