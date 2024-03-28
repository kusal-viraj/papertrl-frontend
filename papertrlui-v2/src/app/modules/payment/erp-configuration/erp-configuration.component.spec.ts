import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErpConfigurationComponent } from './erp-configuration.component';

describe('ErpConfigurationComponent', () => {
  let component: ErpConfigurationComponent;
  let fixture: ComponentFixture<ErpConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErpConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErpConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
