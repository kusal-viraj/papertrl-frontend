import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentDetailViewComponent } from './department-detail-view.component';

describe('DepartmentDetailViewComponent', () => {
  let component: DepartmentDetailViewComponent;
  let fixture: ComponentFixture<DepartmentDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentDetailViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
