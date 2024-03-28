import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PoCreateComponent} from './po-create.component';
import {CommonModule} from '@angular/common';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {InputMaskModule} from 'primeng/inputmask';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {BillSocketService} from '../../../shared/services/bills/bill-socket.service';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {PoService} from '../../../shared/services/po/po.service';
import {mockPoObj} from '../../../shared/helpers/test-data';
import {ToastModule} from 'primeng/toast';


describe('PoCreateComponent', () => {
  let component: PoCreateComponent;
  let fixture: ComponentFixture<PoCreateComponent>;
  let poService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const poServiceSpy = jasmine.createSpyObj('PoService', ['createPurchaseOrder', 'getUom',
      'savePOAsDraft', 'getVendors', 'saveDraft'], ['PoUtility']);

    await TestBed.configureTestingModule({
      declarations: [PoCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: PoService, useValue: poServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoCreateComponent);
      poService = TestBed.inject(PoService);
      component = fixture.componentInstance;
      await component.initFormGroup();
      component.initAddItems();
      component.initAccounts();
    });
  });

  it('01 Check po number field required validation', () => {
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    expect(poNumber.invalid).toBeTruthy();
  });

  it('02 Check po number field length validation', () => {
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    poNumber.patchValue('sccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      {emitEvent: false});
    expect(poNumber.valid).toBeFalsy();
  });

  it('03 Check submit button call with invalid po create form', () => {
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    poNumber.patchValue('csssssssssss', {emitEvent: false});
    component.submitPo(false, 'approval', true, null);
    expect(component.createPurchaseOrderForm.valid).toBeFalsy();
  });

  it('04 Check save as draft action with invalid form', () => {
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    poNumber.patchValue('csssssssssss', {emitEvent: false});
    component.saveAsDraft(component.createPurchaseOrderForm.value);
    expect(component.createPurchaseOrderForm.valid).toBeFalsy();
  });


  it('05 Check save as draft action with valid  form', () => {
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    const vendorId = component.createPurchaseOrderForm.controls.vendorId;
    poNumber.patchValue('csssssssssss');
    vendorId.patchValue(46);
    expect(component.createPurchaseOrderForm.valid).toBeTruthy();
    spyOn<PoCreateComponent, any>(component, 'saveAsDraft');
    expect(component.saveAsDraft).toHaveBeenCalledTimes(0);
  });

  it('06 after success call close method', (done) => {
    spyOn<PoCreateComponent, any>(component, 'close');
    spyOn<PoCreateComponent, any>(component, 'saveAsDraft');
    const poNumber = component.createPurchaseOrderForm.controls.poNumber;
    const vendorId = component.createPurchaseOrderForm.controls.vendorId;
    poNumber.patchValue('csssssssssss');
    vendorId.patchValue(46);
    fixture.whenStable().then(() => {
      expect(component.close).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('07 should has min length validator', () => {
    component.createPurchaseOrderForm.controls.poNumber.setValue('12');
    expect(component.createPurchaseOrderForm.controls.poNumber.hasError('maxlength')).toBeFalse();
  });

  it('08 PocPhone max length validator', () => {
    component.createPurchaseOrderForm.controls.pocPhone.patchValue('3333333333333333332');
    expect(component.createPurchaseOrderForm.controls.pocPhone.hasError('maxlength')).toBeFalse();
  });

  it('09. Check item details default init count whether 10', async () => {
    expect(component.lineItemMainTable.controls.length).toBe(10);
  });

  it('10. Check account details default init count whether 10', () => {
    expect(component.accountDetails.controls.length).toBe(10);
  });

  it('11. PO Edit function', () => {
    expect(component.accountDetails.controls.length).toBe(10);
  });

  it('12 Data patch without vendor form validation', async () => {
    mockPoObj.vendorId = null;
    component.createPurchaseOrderForm.patchValue(mockPoObj);
    expect(component.createPurchaseOrderForm.valid).toBeFalse();
  });

  it('13 Data patch without po number form validation', () => {
    mockPoObj.poNumber = null;
    component.createPurchaseOrderForm.patchValue(mockPoObj);
    expect(component.createPurchaseOrderForm.valid).toBeFalsy();
  });

});
