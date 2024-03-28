import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoReceiptsViewComponent } from './po-receipts-view.component';

describe('PoReceiptsViewComponent', () => {
  let component: PoReceiptsViewComponent;
  let fixture: ComponentFixture<PoReceiptsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoReceiptsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoReceiptsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
