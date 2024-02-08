import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VCardEditComponent } from './v-card-edit.component';

describe('VCardEditComponent', () => {
  let component: VCardEditComponent;
  let fixture: ComponentFixture<VCardEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VCardEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VCardEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
