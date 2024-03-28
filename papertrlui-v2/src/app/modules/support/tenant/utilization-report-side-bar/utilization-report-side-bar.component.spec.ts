import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizationReportSideBarComponent } from './utilization-report-side-bar.component';

describe('UtilizationReportSideBarComponent', () => {
  let component: UtilizationReportSideBarComponent;
  let fixture: ComponentFixture<UtilizationReportSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UtilizationReportSideBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizationReportSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
