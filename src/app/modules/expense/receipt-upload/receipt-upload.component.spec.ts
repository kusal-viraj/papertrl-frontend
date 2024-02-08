import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {ReceiptUploadComponent} from "./receipt-upload.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmationService, MessageService} from "primeng/api";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {DebugElement} from "@angular/core";
import {BehaviorSubject, defer, of} from "rxjs";
import {
  asyncData,
  cardResponse, createResponse,
  employeeResponse, fileResponse, getReceiptDetailResponse,
  getUnSubmitReceiptListResponse,
  okResponse,
  vendorResponse
} from "../../../shared/helpers/test-data";
import {ReceiptSocketService} from "../../../shared/services/expense/receipt-socket.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";

describe('Receipt Upload', () => {

  let component: ReceiptUploadComponent;
  let fixture: ComponentFixture<ReceiptUploadComponent>;
  let el: DebugElement;
  let expenseService: any;
  let billSubmitService: any;
  let automationService: any;
  let privilegeService: any;
  let receiptSocketService: any;

  beforeEach(async () => {
    let expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['getUnSavedReceiptsList',
      'getCardDetail', 'getExistingCardsWithPrivilege', 'getReceiptDetail', 'downloadReceipt', 'createReceipt',
      'cardListSubject'])
    let billSubmitServiceSpy = jasmine.createSpyObj('BillSubmitService', ['getVendorList'])
    let automationServiceSpy = jasmine.createSpyObj('AutomationService', ['getApprovalUserList'])
    let privilegeServiceSpy = jasmine.createSpyObj('PrivilegeService', ['isAuthorized'])
    let receiptSocketServiceSpy = jasmine.createSpyObj('ReceiptSocketService',
      ['configReceiptWebSocketConnection', 'connect', 'behaviorSubject', 'disconnect'])

    TestBed.configureTestingModule({
      declarations: [ReceiptUploadComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule],
      providers: [MessageService, ConfirmationService,
        {provide: ExpenseService, useValue: expenseServiceSpy},
        {provide: BillSubmitService, useValue: billSubmitServiceSpy},
        {provide: AutomationService, useValue: automationServiceSpy},
        {provide: PrivilegeService, useValue: privilegeServiceSpy},
        {provide: ReceiptSocketService, useValue: receiptSocketServiceSpy}
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(ReceiptUploadComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      expenseService = TestBed.inject(ExpenseService);
      billSubmitService = TestBed.inject(BillSubmitService);
      automationService = TestBed.inject(AutomationService);
      privilegeService = TestBed.inject(PrivilegeService);
      receiptSocketService = TestBed.inject(ReceiptSocketService);
      automationService.getApprovalUserList.and.returnValue(of(employeeResponse()));
      billSubmitService.getVendors.and.returnValue(of(vendorResponse()));
      expenseService.getReceiptDetail.and.returnValue(asyncData(getReceiptDetailResponse()).toPromise());
      expenseService.getExistingCardsWithPrivilege.and.returnValue(of(cardResponse()));
      expenseService.getUnSavedReceiptsList.and.returnValue(of(getUnSubmitReceiptListResponse()));
      expenseService.downloadReceipt.and.returnValue(of(fileResponse()));
      expenseService.cardListSubject = new BehaviorSubject(true);
      expenseService.receiptListSubject = new BehaviorSubject(true);
      expenseService.createReceipt.and.returnValue(of(createResponse()));

      component.receiptList = [];
      component.initForm();
    })
  })
  it('should create a component', function () {
    expect(component).toBeTruthy();
  });

  it('should get the vendor dropdown list', () => {
    component.getVendorList();
    expect(component.vendorList.data.length).toBeGreaterThan(1);
    expect(component.vendorList.data[0].name).toContain('Vendor Name')
  });

  it('should get the card dropdown list', () => {
    component.getExistingCards();
    expect(component.cards.data.length).toBeGreaterThan(0);
    expect(component.cards.data[0].name).toContain('XXXX-XXXX-XXXX-1234')
  });

  it('should get the existing pending cards', fakeAsync(() => {
    expenseService.getReceiptDetail.and.returnValue(asyncData(getReceiptDetailResponse()).toPromise());
    component.getPendingReceiptList();
    expect(component.receiptList.length).toBeGreaterThan(0);
    expect(expenseService.getReceiptDetail).toHaveBeenCalledWith(1);
    tick();
    expect(component.receiptCreateFormGroup.value.id).toBe(1);
  }));

  it('should select a receipt data and patch values to form', fakeAsync(() => {
    expenseService.getReceiptDetail.and.returnValue(asyncData(getReceiptDetailResponse()).toPromise());
    component.receiptSelected(getUnSubmitReceiptListResponse().body[0]);
    tick();
    expect(component.receiptCreateFormGroup.value.id).toBe(1);
  }));

  it('should validate the form amount field', () => {
    const amount = component.receiptCreateFormGroup.controls['amount'];
    amount.patchValue(null);
    expect(amount.valid).toBeFalsy();
    amount.patchValue(0);
    expect(amount.valid).toBeFalsy();
    amount.patchValue(10);
    expect(amount.valid).toBeTruthy();
  });

  it('should validate the form transactionDate field', () => {
    const transactionDate = component.receiptCreateFormGroup.controls['transactionDateStr'];
    transactionDate.patchValue(null);
    expect(transactionDate.valid).toBeFalsy();
    transactionDate.patchValue('12/12/2022');
    expect(transactionDate.valid).toBeTruthy();
  });

  it('should validate the form merchant field', () => {
    const merchant = component.receiptCreateFormGroup.controls['merchant'];
    merchant.patchValue(null);
    expect(merchant.valid).toBeFalsy();
    merchant.patchValue(2);
    expect(merchant.valid).toBeTruthy();
  });

  it('should validate the form when fields are empty when submitting', () => {
    component.submitForm();
    expect(component.receiptCreateFormGroup.dirty).toBeTruthy();
  });

  it('should validate the form when fields are not empty when submitting and create transaction', () => {
    component.receiptCreateFormGroup.controls['transactionDateStr'].patchValue('12/12/2022');
    component.receiptCreateFormGroup.controls['vendorId'].patchValue(1);
    component.receiptCreateFormGroup.controls['cardNo'].patchValue('1234');
    component.receiptCreateFormGroup.controls['merchant'].patchValue(2);
    component.receiptCreateFormGroup.controls['description'].patchValue('lorem ipsum');
    component.receiptCreateFormGroup.controls['amount'].patchValue(1200);
    component.receiptCreateFormGroup.controls['id'].patchValue(1);
    component.submitForm();
    expect(expenseService.createReceipt).toHaveBeenCalled()
  });

  it('should close the drawer if no receipt after a successful receipt update', function () {
    spyOn(component.isCloseSubmissionView, 'emit');
    component.receiptList = getUnSubmitReceiptListResponse().body
    component.currentIndex = 0
    component.receiptList.splice(0, 1);
    component.createReceipt({})
    expect(component.isCloseSubmissionView.emit).toHaveBeenCalledWith(true);
  });

  it('should select the next available receipt in a successful receipt update', function () {
    const spy = spyOn(component, 'receiptSelected');
    component.receiptList = getUnSubmitReceiptListResponse().body
    component.currentIndex = 0
    component.createReceipt({})
    expect(spy).toHaveBeenCalledWith(component.receiptList[component.currentIndex]);
  });
})
