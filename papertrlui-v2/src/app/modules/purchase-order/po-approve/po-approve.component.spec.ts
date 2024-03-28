import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PoApproveComponent} from './po-approve.component';
import {mockPoObj} from '../../../shared/helpers/test-data';
import {PoService} from '../../../shared/services/po/po.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {InputMaskModule} from 'primeng/inputmask';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {ToastModule} from 'primeng/toast';


describe('PoApproveComponent', () => {

  let component: PoApproveComponent;
  let fixture: ComponentFixture<PoApproveComponent>;
  let poService;

  beforeEach(async () => {

      TestBed.configureTestingModule({
        declarations: [PoApproveComponent],
        imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
          InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
          ToastModule],
        providers: [MessageService, ConfirmationService]
      }).compileComponents().then(() => {
        fixture = TestBed.createComponent(PoApproveComponent);
        poService = TestBed.inject(PoService);
        component = fixture.componentInstance;
        component.ngOnInit();
      });
    });

  it('01 Form Validation check after patch data', async () => {
    component.purchaseOrderApprovalMainForm.patchValue(mockPoObj);
    expect(component.purchaseOrderApprovalMainForm.valid).toBeTruthy();
  });

  it('02 Check null of PO number', async () => {
    mockPoObj.poNumber = null;
    expect(component.purchaseOrderApprovalMainForm.get('poNumber').value).toBeNull();
  });


  it('03 Check null of Vendor', async () => {
    mockPoObj.vendorId = null;
    expect(component.purchaseOrderApprovalMainForm.get('vendorId').value).toBeNull();
  });

  it('04 not an number netAmount', () => {
    expect(isNumber(component.purchaseOrderApprovalMainForm.get('netAmount').value)).toBeFalse();
  });

  it('05 not an number check after patch form value', () => {
    expect(isNumber(Number(component.purchaseOrderApprovalMainForm.get('netAmount').value))).toBeTruthy();
  });
});
