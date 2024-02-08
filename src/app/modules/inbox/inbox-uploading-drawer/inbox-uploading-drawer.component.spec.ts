import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxUploadingDrawerComponent } from './inbox-uploading-drawer.component';

describe('InboxUploadingDrawerComponent', () => {
  let component: InboxUploadingDrawerComponent;
  let fixture: ComponentFixture<InboxUploadingDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboxUploadingDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboxUploadingDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
