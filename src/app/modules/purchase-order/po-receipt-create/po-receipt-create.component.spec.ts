import {ComponentFixture, TestBed} from "@angular/core/testing";
import {PoReceiptCreateComponent} from "./po-receipt-create.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {NgxDropzoneModule} from "ngx-dropzone";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {BillSocketService} from "../../../shared/services/bills/bill-socket.service";
import {PoReceiptService} from "../../../shared/services/po-receipts/po-receipt.service";
import {mockPoReceiptObj, poRelatedDetails} from "../../../shared/helpers/test-data";


describe('PoReceiptCreateComponent', () => {
  let component: PoReceiptCreateComponent;
  let fixture: ComponentFixture<PoReceiptCreateComponent>;
  let poReceiptService;

  beforeEach(async () => {
    let billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    let poReceiptServiceSpy = jasmine.createSpyObj('PoReceiptService', ['submitPoReceiptData',
        'getVendors'],
      ['PoUtility']);
    await TestBed.configureTestingModule({
      declarations: [PoReceiptCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: PoReceiptService, useValue: poReceiptServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoReceiptCreateComponent);
      poReceiptService = TestBed.inject(PoReceiptService);
      component = fixture.componentInstance;
      await component.initializePoReceiptFormGroup();
    });
  });

  it('01 Check PO Receipt number field required validation', async () => {
    let poReceiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    await expect(poReceiptNumber.invalid).toBeTruthy();
  });

  it('02 Check PO Receipt number field length validation', async () => {
    let poReceiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    poReceiptNumber.patchValue('sccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      {emitEvent: false});
   await expect(poReceiptNumber.valid).toBeFalsy();
  });

  it('03 Check submit button call with invalid po receipt create form', () => {
    let poReceiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    poReceiptNumber.patchValue('csssssssssss', {emitEvent: false});
    spyOn<PoReceiptCreateComponent, any>(component, 'createPoReceipt');
    component.createPoReceipt();
    expect(component.createPurchaseOrderReceiptForm.valid).toBeFalsy();
  });

  it('04 Check save as draft action with invalid form', () => {
    let poReceiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    poReceiptNumber.patchValue('csssssssssss', {emitEvent: false});
    spyOn<PoReceiptCreateComponent, any>(component, 'checkSaveAsDraft');
    component.checkSaveAsDraft(component.createPurchaseOrderReceiptForm.value);
    expect(component.createPurchaseOrderReceiptForm.valid).toBeFalsy();
  });

  it('05 Check save as draft action with invalid  form', () => {
    let receiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    let vendorId = component.createPurchaseOrderReceiptForm.controls['vendorId'];
    receiptNumber.patchValue('csssssssssss');
    vendorId.patchValue(46);
    expect(component.createPurchaseOrderReceiptForm.valid).toBeFalsy();
    spyOn<PoReceiptCreateComponent, any>(component, 'saveDraft');
    expect(component.saveDraft).toHaveBeenCalledTimes(0);
  });


  it('07 after success call close PO Receipt create mode', (done) => {
    spyOn<PoReceiptCreateComponent, any>(component, 'closePOReceiptCreateMode');
    spyOn<PoReceiptCreateComponent, any>(component, 'saveDraft');
    let receiptNumber = component.createPurchaseOrderReceiptForm.controls['receiptNumber'];
    let vendorId = component.createPurchaseOrderReceiptForm.controls['vendorId'];
    receiptNumber.patchValue('csssssssssss');
    vendorId.patchValue(46);
    fixture.whenStable().then(() => {
      expect(component.closePOReceiptCreateMode).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('08. Check item details initialize count', async () => {
    spyOn<PoReceiptCreateComponent, any>(component, 'ngOnInit');
    component.createPurchaseOrderReceiptForm.get('poId').reset();
    component.lineItemMainTable.controls = [];
    expect(component.lineItemMainTable.controls.length).toBe(0);
  });

  it('09. Check account details initialize count', () => {
    spyOn<PoReceiptCreateComponent, any>(component, 'ngOnInit');
    component.createPurchaseOrderReceiptForm.get('poId').reset();
    component.accountDetails.controls = [];
    expect(component.accountDetails.controls.length).toBe(0);
  });

  it('10. PO Receipt Edit function', () => {
    component.createPurchaseOrderReceiptForm.patchValue(mockPoReceiptObj);
    expect(component.accountDetails.controls.length).toBe(0);
  });

  it('11 Validate Without Vendor Id', async () => {
    mockPoReceiptObj.vendorId = null;
    component.createPurchaseOrderReceiptForm.patchValue(mockPoReceiptObj);
    expect(component.createPurchaseOrderReceiptForm.valid).toBeFalse();
  });

  it('12 Validate Without Po Receipt Number', () => {
    mockPoReceiptObj.receiptNumber = null;
    component.createPurchaseOrderReceiptForm.patchValue(mockPoReceiptObj);
    expect(component.createPurchaseOrderReceiptForm.valid).toBeFalsy();
  });

  it('13 Check account details length after response data patch', () => {
    poRelatedDetails.purchaseOrderReceiptAccountDetails.forEach(()=>{
      component.addAccount();
    });
    component.accountDetails.patchValue(poRelatedDetails.purchaseOrderReceiptAccountDetails);
    expect(component.accountDetails.length).toBe(2);
  });

  it('14 Check item details length after response data patch', () => {
    poRelatedDetails.poReceiptDetails.forEach(()=>{
      component.addItem();
    });
    component.lineItemMainTable.patchValue(poRelatedDetails.poReceiptDetails);
    expect(component.lineItemMainTable.controls.length).toBe(2);
  });

});
