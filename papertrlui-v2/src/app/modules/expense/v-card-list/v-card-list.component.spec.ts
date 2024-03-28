import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VCardListComponent } from './v-card-list.component';

describe('VCardListComponent', () => {
  let component: VCardListComponent;
  let fixture: ComponentFixture<VCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VCardListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
