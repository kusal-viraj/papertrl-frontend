import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DCardCreateComponent } from './d-card-create.component';

describe('DCardCreateComponent', () => {
  let component: DCardCreateComponent;
  let fixture: ComponentFixture<DCardCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DCardCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DCardCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
