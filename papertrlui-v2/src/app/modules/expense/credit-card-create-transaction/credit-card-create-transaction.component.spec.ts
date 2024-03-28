import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {CreditCardCreateTransactionComponent} from "./credit-card-create-transaction.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {DebugElement} from "@angular/core";
import {MessageService} from "primeng/api";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {By} from "@angular/platform-browser";
import {of} from "rxjs";
import {cardResponse, employeeResponse, okResponse} from "../../../shared/helpers/test-data";

describe('Credit Card Transaction Create', () => {
  let component: CreditCardCreateTransactionComponent;
  let fixture: ComponentFixture<CreditCardCreateTransactionComponent>;
  let el: DebugElement;
  let expenseService: any;
  let billSubmitService: any;
  let automationService: any;
  let privilegeService: any;


  beforeEach(async(() => {
    let expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['getExistingCards', 'createTransaction'])
    let billSubmitServiceSpy = jasmine.createSpyObj('BillSubmitService', ['getVendorList'])
    let automationServiceSpy = jasmine.createSpyObj('AutomationService', ['getApprovalUserList'])
    let privilegeServiceSpy = jasmine.createSpyObj('PrivilegeService', ['isAuthorized'])

    TestBed.configureTestingModule({
      declarations: [CreditCardCreateTransactionComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule],
      providers: [MessageService,
        {provide: ExpenseService, useValue: expenseServiceSpy},
        {provide: BillSubmitService, useValue: billSubmitServiceSpy},
        {provide: AutomationService, useValue: automationServiceSpy},
        {provide: PrivilegeService, useValue: privilegeServiceSpy}
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(CreditCardCreateTransactionComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      expenseService = TestBed.inject(ExpenseService);
      billSubmitService = TestBed.inject(BillSubmitService);
      automationService = TestBed.inject(AutomationService);
      privilegeService = TestBed.inject(PrivilegeService);
      automationService.getApprovalUserList.and.returnValue(of(employeeResponse()));
      expenseService.getExistingCards.and.returnValue(of(cardResponse()));
      expenseService.createTransaction.and.returnValue(of(okResponse()));
      component.ngOnInit();
    })
  }))

  it('should create a component', function () {
    expect(component).toBeTruthy();
  });

  it('should display the 6 fields', function () {
    const form = el.query(By.css('form'));
    const dropDowns = form.queryAll(By.css('p-dropdown'));
    const inputs = form.queryAll(By.css('input'));
    const pAutoCompletes = form.queryAll(By.css('p-autoComplete'));
    const pCalendar = form.queryAll(By.css('p-calendar'));
    const textarea = form.queryAll(By.css('textarea'));
    expect(dropDowns[0].attributes.formControlName).toContain('cardNo');
    expect(inputs[1].attributes.formControlName).toContain('amount');
    expect(pAutoCompletes[0].attributes.formControlName).toContain('merchant');
    expect(pCalendar[0].attributes.formControlName).toContain('transactionDate');
    expect(pCalendar[1].attributes.formControlName).toContain('postingDate');
    expect(textarea[0].attributes.formControlName).toContain('description');
  });

  it('should get the merchant dropdown list', () => {
    component.getMerchants();
    expect(component.merchants.data.length).toBeGreaterThan(1);
    expect(component.merchants.data[0].name).toContain('Testa')
  });

  it('should get the card dropdown list', () => {
    component.getExistingCards();
    expect(component.cards.data.length).toBeGreaterThan(0);
    expect(component.cards.data[0].name).toContain('XXXX-XXXX-XXXX-1234')
  });

  it('should validate the form amount field', () => {
    const amount = component.formGroup.controls['amount'];
    amount.patchValue(null);
    expect(amount.valid).toBeFalsy();
    amount.patchValue(0);
    expect(amount.valid).toBeFalsy();
    amount.patchValue(10);
    expect(amount.valid).toBeTruthy();
  });

  it('should validate the form merchant field', () => {
    const merchant = component.formGroup.controls['merchant'];
    merchant.patchValue(null);
    expect(merchant.valid).toBeFalsy();
    merchant.patchValue(2);
    expect(merchant.valid).toBeTruthy();
  });

  it('should validate the form cardNo field', () => {
    const cardNo = component.formGroup.controls['cardNo'];
    cardNo.patchValue(null);
    expect(cardNo.valid).toBeFalsy();
    cardNo.patchValue(2);
    expect(cardNo.valid).toBeTruthy();
  });

  it('should validate the form transactionDate field', () => {
    const transactionDate = component.formGroup.controls['transactionDate'];
    transactionDate.patchValue(null);
    expect(transactionDate.valid).toBeFalsy();
    transactionDate.patchValue('12/12/2022');
    expect(transactionDate.valid).toBeTruthy();
  });

  it('should validate the form when fields are empty when submitting', () => {
    component.submitForm();
    expect(component.formGroup.dirty).toBeTruthy();
  });

  it('should validate the form when fields are not empty when submitting and create transaction', () => {
    component.formGroup.controls['transactionDate'].patchValue(new Date('12/12/2022'));
    component.formGroup.controls['postingDate'].patchValue(new Date('12/12/2022'));
    component.formGroup.controls['cardNo'].patchValue('1234');
    component.formGroup.controls['merchant'].patchValue(2);
    component.formGroup.controls['description'].patchValue('lorem ipsum');
    component.formGroup.controls['amount'].patchValue(1200);
    component.submitForm();
    expect(expenseService.createTransaction).toHaveBeenCalled()
  });

  it('should validate the card add new function', function () {
    component.formGroup.controls['cardNo'].patchValue(-1);
    component.cardChanged({value: -1});
    expect(component.formGroup.get('cardNo').value).toBeNull();
    expect(component.addNewCard).toBeTruthy();
  });

  it('should validate the card change function', function () {
    component.formGroup.controls['cardNo'].patchValue(1);
    component.cardChanged({value: 1});
    expect(component.formGroup.get('cardNo').value).toBe(1);
    expect(component.addNewCard).toBeFalsy();
  });
})
