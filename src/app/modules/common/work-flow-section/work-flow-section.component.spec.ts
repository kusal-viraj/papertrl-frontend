import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFlowSectionComponent } from './work-flow-section.component';

describe('WorkFlowSectionComponent', () => {
  let component: WorkFlowSectionComponent;
  let fixture: ComponentFixture<WorkFlowSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkFlowSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFlowSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
