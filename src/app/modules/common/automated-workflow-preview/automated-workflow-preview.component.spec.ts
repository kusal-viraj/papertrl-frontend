import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatedWorkflowPreviewComponent } from './automated-workflow-preview.component';

describe('AutomatedWorkflowPreviewComponent', () => {
  let component: AutomatedWorkflowPreviewComponent;
  let fixture: ComponentFixture<AutomatedWorkflowPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomatedWorkflowPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomatedWorkflowPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
