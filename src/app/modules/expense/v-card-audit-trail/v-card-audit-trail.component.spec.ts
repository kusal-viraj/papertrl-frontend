import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VCardAuditTrailComponent } from './v-card-audit-trail.component';

describe('VCardAuditTrailComponent', () => {
  let component: VCardAuditTrailComponent;
  let fixture: ComponentFixture<VCardAuditTrailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VCardAuditTrailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VCardAuditTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
