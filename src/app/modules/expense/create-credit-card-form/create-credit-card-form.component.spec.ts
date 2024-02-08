import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {CreateCreditCardFormComponent} from "./create-credit-card-form.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {RouterTestingModule} from "@angular/router/testing";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {of} from "rxjs";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {cardDetailsResponse, employeeResponse, okResponse, vendorResponse} from "../../../shared/helpers/test-data";
import {BillsService} from '../../../shared/services/bills/bills.service';


describe('Credit Card Create Component', () => {

  let creditCardFormComponent: CreateCreditCardFormComponent;
  let fixture: ComponentFixture<CreateCreditCardFormComponent>;
  let el: DebugElement;
  let expenseService: any;
  let billSubmitService: any;
  let billsService: any;
  let automationService: any;
  let privilegeService: any;

  beforeEach(async(() => {
    let expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['addCard', 'getCardDetail'])
    let billSubmitServiceSpy = jasmine.createSpyObj('BillSubmitService', ['getVendorList'])
    let automationServiceSpy = jasmine.createSpyObj('AutomationService', ['getApprovalUserList'])
    let privilegeServiceSpy = jasmine.createSpyObj('PrivilegeService', ['isAuthorized'])
    let billsServiceSpy = jasmine.createSpyObj('BillsService', ['getVendors'])

    TestBed.configureTestingModule({
      declarations: [CreateCreditCardFormComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule],
      providers: [MessageService,
        {provide: ExpenseService, useValue: expenseServiceSpy},
        {provide: BillSubmitService, useValue: billSubmitServiceSpy},
        {provide: AutomationService, useValue: automationServiceSpy},
        {provide: PrivilegeService, useValue: privilegeServiceSpy},
        {provide: BillsService, useValue: billsServiceSpy}
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CreateCreditCardFormComponent);
        creditCardFormComponent = fixture.componentInstance;
        el = fixture.debugElement;
        expenseService = TestBed.inject(ExpenseService);
        billSubmitService = TestBed.inject(BillSubmitService);
        automationService = TestBed.inject(AutomationService);
        privilegeService = TestBed.inject(PrivilegeService);
        automationService.getApprovalUserList.and.returnValue(of(employeeResponse()));
        billsService.getVendors.and.returnValue(of(vendorResponse()));
        expenseService.addCard.and.returnValue(of(okResponse()));
        creditCardFormComponent.ngOnInit();
      })
  }))
  it('should create a component', function () {
    expect(creditCardFormComponent).toBeTruthy();
  });

  it('should display cardNo, employee and vendor fields', function () {
    const form = el.query(By.css('form'));
    const masks = form.query(By.css('p-inputMask'))
    const dropDowns = form.queryAll(By.css('p-dropdown'))
    expect(masks.attributes.formControlName).toContain('cardNo')
    expect(dropDowns[0].attributes.formControlName).toContain('employee')
    expect(dropDowns[1].attributes.formControlName).toContain('vendorId')
  });

  it('should get the employee list', () => {
    fixture.detectChanges();
    expect(creditCardFormComponent.employees.data.length).toBeGreaterThan(1);
    expect(creditCardFormComponent.employees.data[0].name).toContain('Testa')
  });

  it('should get the vendor list', () => {
    fixture.detectChanges();
    expect(creditCardFormComponent.vendorList.data.length).toBeGreaterThan(1);
    expect(creditCardFormComponent.vendorList.data[0].name).toContain('Vendor Name')
  });

  it('card number should be required', () => {
    expect(creditCardFormComponent.formGroup.controls['cardNo'].valid).toBeFalsy();
  });

  it('employee should be validated', () => {
    expect(creditCardFormComponent.formGroup.controls['employee'].valid).toBeFalsy();
  });

  it('vendor should not be required', () => {
    expect(creditCardFormComponent.formGroup.controls['vendorId'].valid).toBeTruthy();
  });

  it('validate card No after entering card details', () => {
    const cardNo = creditCardFormComponent.formGroup.controls['cardNo'];
    cardNo.patchValue('1234');
    expect(cardNo.valid).toBeTruthy();
  });

  it('validate employee after entering employee details', () => {
    const employee = creditCardFormComponent.formGroup.controls['employee'];
    employee.patchValue('test@gmail.com');
    expect(employee.valid).toBeTruthy();
  });

  it('should clear the form after reset function', () => {
    const employee = creditCardFormComponent.formGroup.controls['employee'];
    const cardNo = creditCardFormComponent.formGroup.controls['cardNo'];
    const vendor = creditCardFormComponent.formGroup.controls['vendorId'];
    employee.patchValue('test@gmail.com');
    cardNo.patchValue('1234');
    vendor.patchValue(1);
    creditCardFormComponent.resetForm();
    expect(employee.valid).toBeFalsy();
    expect(cardNo.valid).toBeFalsy();
    expect(vendor.valid).toBeTruthy();
  });

  it('should validate the form when fields are empty when submitting', () => {
    creditCardFormComponent.submitForm();
    expect(creditCardFormComponent.formGroup.dirty).toBeTruthy();
  });

  it('should validate the form when fields are not empty when submitting', () => {
    const employee = creditCardFormComponent.formGroup.controls['employee'];
    const cardNo = creditCardFormComponent.formGroup.controls['cardNo'];
    const vendor = creditCardFormComponent.formGroup.controls['vendorId'];
    employee.patchValue('test@gmail.com');
    cardNo.patchValue('1234');
    vendor.patchValue(1);
    creditCardFormComponent.submitForm();
    expect(expenseService.addCard).toHaveBeenCalled()
  });

  it('should get card details for edit view and patch to form', () => {
    expenseService.getCardDetail.and.returnValue(of(cardDetailsResponse()));
    creditCardFormComponent.editView = true;
    creditCardFormComponent.ngOnInit();
    expect(expenseService.getCardDetail).toHaveBeenCalled();
    expect(creditCardFormComponent.formGroup.valid).toBeTruthy();
    expect(creditCardFormComponent.formGroup.value.id).toBe(1);
    expect(creditCardFormComponent.formGroup.value.employee.id).toEqual("test@gmail.com")
    expect(creditCardFormComponent.formGroup.value.cardNo).toBe('12345');
    expect(creditCardFormComponent.formGroup.value.vendorId).toBe(1);
  });

})
