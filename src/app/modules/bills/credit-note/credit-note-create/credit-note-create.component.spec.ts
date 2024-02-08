import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
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
import {CreditNoteCreateComponent} from "./credit-note-create.component";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {mockCreditNoteObj} from "../../../../shared/helpers/test-data";
import {BillUtility} from "../../bill-utility";

describe('CreditNoteCreateComponent', () => {
  let component: CreditNoteCreateComponent;
  let fixture: ComponentFixture<CreditNoteCreateComponent>;
  let creditNoteService: CreditNoteService;
  let billUtility: BillUtility;

  beforeEach(async () => {
    let creditNoteServiceSpy = jasmine.createSpyObj('CreditNoteService',
      ['createCreditNote', 'getDepartment', 'vendorRelevantItemList'], ['BillUtility']);

    await TestBed.configureTestingModule({
      declarations: [CreditNoteCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: CreditNoteService, useValue: creditNoteServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(CreditNoteCreateComponent);
      creditNoteService = TestBed.inject(CreditNoteService);
      component = fixture.componentInstance;
      billUtility = fixture.componentInstance.billPaymentUtility;
      await component.initializeFormGroup();
    });
  });

  it('01 Validate Credit Note Number Field', () => {
    let creditNoteNo = component.createCreditNoteForm.controls['creditNoteNo'];
    creditNoteNo.patchValue(null);
    expect(creditNoteNo.invalid).toBeTruthy();
  });

  it('02 Validate Credit note number max length', () => {
    let creditNoteNo = component.createCreditNoteForm.controls['creditNoteNo'];
    creditNoteNo.patchValue('51111111111111111111111111111111111111111111111111111111111111111111111111111111111');
    expect(creditNoteNo.invalid).toBeTruthy();
  });

  it('03 Validate data type of Credit note number ', () => {
    let creditNoteNo = component.createCreditNoteForm.controls['creditNoteNo'];
    creditNoteNo.patchValue(1002);
    expect(creditNoteNo.valid).toBeTruthy();
  });

  it('04 Validate empty space of Credit note number ', () => {
    let creditNoteNo = component.createCreditNoteForm.controls['creditNoteNo'];
    creditNoteNo.patchValue('');
    expect(creditNoteNo.valid).toBeFalsy();
  });

  it('05 Validate field in save as draft: Credit Note Number is null', () => {
    spyOn<CreditNoteCreateComponent, any>(component, 'checkSaveAsDraft');
    component.checkSaveAsDraft(component.createCreditNoteForm.value);
    expect(component.createCreditNoteForm.controls['creditNoteNo'].valid).toBeFalsy();
  });

  it('05 Validate field in save as draft: Vendor is null', () => {
    spyOn<CreditNoteCreateComponent, any>(component, 'checkSaveAsDraft');
    component.checkSaveAsDraft(component.createCreditNoteForm.value);
    expect(component.createCreditNoteForm.controls['vendorId'].valid).toBeFalsy();
  });

  it('05 Validate form for save as draft: Credit Note Number is not null or vendor id is null', () => {
    spyOn<CreditNoteCreateComponent, any>(component, 'checkSaveAsDraft');
    component.createCreditNoteForm.value.vendorId = null;
    component.createCreditNoteForm.value.creditNoteNo = '5151C';
    component.checkSaveAsDraft(component.createCreditNoteForm.value);
    expect(component.createCreditNoteForm.valid).toBeFalsy();
  });

  it('05 Validate form for save as draft: Credit Note Number is null or vendor id is not null', () => {
    spyOn<CreditNoteCreateComponent, any>(component, 'checkSaveAsDraft');
    component.createCreditNoteForm.value.vendorId = '1000C';
    component.createCreditNoteForm.value.creditNoteNo = null;
    component.checkSaveAsDraft(component.createCreditNoteForm.value);
    expect(component.createCreditNoteForm.valid).toBeFalsy();
  });

  it('06 Validate form for save as draft: Credit Note Number is not null or vendor id is not null', () => {
    spyOn<CreditNoteCreateComponent, any>(component, 'saveDraft');
    component.createCreditNoteForm.value.vendorId = 1;
    component.createCreditNoteForm.value.creditNoteNo = '45151XX1';
    expect(component.saveDraft).toBeTruthy();
  });

  it('07 Line Amount calculation', fakeAsync(() => {
    component.addItem();
    spyOn<CreditNoteCreateComponent, any>(component, 'calculateAmount').and.callThrough();
    let qty = component.lineItemMainTable.controls[0].get('qty');
    let unitPrice = component.lineItemMainTable.controls[0].get('unitPrice');
    qty.patchValue(2);
    unitPrice.patchValue(200);
    let amount = qty.value * unitPrice.value;
    expect(amount).toEqual(400);
  }));

  it('08 Line Amount calculation with undefined values', fakeAsync(() => {
    component.addItem();
    spyOn<CreditNoteCreateComponent, any>(component, 'calculateAmount').and.callThrough();
    let qty = component.lineItemMainTable.controls[0].get('qty');
    let unitPrice = component.lineItemMainTable.controls[0].get('unitPrice');
    qty.patchValue(undefined);
    unitPrice.patchValue(200);
    let amount = qty.value * unitPrice.value;
    expect(amount).toEqual(NaN);
  }));

  it('09 Line Amount calculation with string values', fakeAsync(() => {
    component.addItem();
    spyOn<CreditNoteCreateComponent, any>(component, 'calculateAmount').and.callThrough();
    let qty = component.lineItemMainTable.controls[0].get('qty');
    let unitPrice = component.lineItemMainTable.controls[0].get('unitPrice');
    qty.patchValue('10');
    unitPrice.patchValue('200');
    let amount = qty.value * unitPrice.value;
    expect(amount).toEqual(2000);
  }));

  it('10 edit view- patch values', fakeAsync (() => {
    component.createCreditNoteForm.patchValue(mockCreditNoteObj);
    expect(component.createCreditNoteForm.value.creditNoteNo).toEqual('CDF01');
  }));

  it('11 Initialized item count', fakeAsync(() => {
    spyOn<CreditNoteCreateComponent, any>(component, 'initAddItems');
    component.initAddItems();
    expect(component.lineItemMainTable.length).toEqual(0);
  }));



});
