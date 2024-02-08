import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {SplitterModule} from "@progress/kendo-angular-layout";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {TabViewModule} from "primeng/tabview";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {RouterModule} from "@angular/router";
import {ExpenseCreateComponent} from "./expense-create.component";
import {CalendarModule} from "primeng/calendar";
import {AppConstant} from "../../../shared/utility/app-constant";
import {
  expenseMockObject, merchantSuggestions,
  merchantWiseAccount,
  okResponse
} from "../../../shared/helpers/test-data";
import {DebugElement} from "@angular/core";
import {TableModule} from "primeng/table";
import {of} from "rxjs";
import {CommonModule} from "@angular/common";
import {BillsService} from '../../../shared/services/bills/bills.service';

describe('ExpenseCreateComponent', () => {
  let component: ExpenseCreateComponent;
  let fixture: ComponentFixture<ExpenseCreateComponent>;
  let privilegeService: any;
  let expenseService: any;
  let el: DebugElement;

  beforeEach(async () => {
    let privilegeServiceSpy = jasmine.createSpyObj('PrivilegeService', ['isAuthorized'])
    let billsServiceSpy = jasmine.createSpyObj('BillsService', ['getVendors', 'getProjectTask'])
    let expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['searchMerchants',
        'searchMerchantWiseAcc', 'getExpenseAccountList', 'getExpenseTypeList',
        'getApprovalGroupList', 'getApprovalUserListAccordingToVendor', 'getApprovalUserList'],
      ['expenseUtility'])

    TestBed.configureTestingModule({
      declarations: [ExpenseCreateComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, SplitterModule, FormsModule, CommonModule,
        InputMaskModule, DropdownModule, ButtonModule, TabViewModule, ConfirmDialogModule, OverlayPanelModule,
        RouterModule, CalendarModule, TableModule],
      providers: [MessageService, ConfirmationService,
        {provide: PrivilegeService, useValue: privilegeServiceSpy},
        {provide: BillsService, useValue: billsServiceSpy},
        {provide: ExpenseService, useValue: expenseServiceSpy}]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(ExpenseCreateComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      privilegeService = TestBed.inject(PrivilegeService);
      expenseService = TestBed.inject(ExpenseService);
      expenseService.searchMerchants.and.returnValue(of(merchantSuggestions()));
      expenseService.searchMerchantWiseAcc.and.returnValue(of(merchantWiseAccount()));
      component.initForm();
    });
  });

  it('should create a component', function () {
    expect(component).toBeTruthy();
  });

  it('check report name field validity with empty', () => {
    let vendorId = component.createExpenseForm.controls['reportName'];
    expect(vendorId.invalid).toBeTruthy();
  });

  it('check report name field validity with value', () => {
    component.createExpenseForm.controls['reportName'].patchValue('sample name');
    expect(component.createExpenseForm.controls['reportName'].invalid).toBeFalsy();
  });

  it('check whole form validation with values', () => {
    component.createExpenseForm.patchValue(expenseMockObject);
    expect(component.createExpenseForm.invalid).toBeFalsy();
  });

  it('try to validate amount field with zero value', () => {
    component.createExpenseForm.get('totalAmount').patchValue(AppConstant.ZERO);
    expect(component.createExpenseForm.valid).toBeFalsy();
  });

  it('check whole form validation without mandatory values', () => {
    expect(component.createExpenseForm.valid).toBeFalsy();
  });

  it('should get the suggestions of merchants when typing minimum of 2 letters', function () {
    const query = {query: 'Ni'}
    component.addExpenseRecords();
    component.searchMerchants(query, 0, false);
    expect(component.merchantResults.length).toBeGreaterThan(1);
    expect(component.merchantResults[0]).toBe('Nike');
  });

  it('should get the empty list of merchants when clearing all the letters', function () {
    const query = {query: ''}
    component.addExpenseRecords();
    expenseService.searchMerchants.and.returnValue(of(okResponse()));
    component.searchMerchants(query, 0, false);
    expect(component.merchantResults.length).toBeUndefined();
  });

  it('should patch the account when correct word is typed', function () {
    const query = {query: 'Nike'}
    component.addExpenseRecords();
    component.searchMerchants(query, 0, false);
    expect(component.expenseDetails.controls[0].get('accountId').value).toBe(10);
  });

  it('should patch the account when correct word is selected from Suggestions', function () {
    component.addExpenseRecords();
    component.searchMerchants('Nike', 0, true);
    expect(expenseService.searchMerchants).toHaveBeenCalledTimes(0)
    expect(component.expenseDetails.controls[0].get('accountId').value).toBe(10);
  });

  it('should clear the account when merchant is erased', function () {
    const query = {query: ''}
    component.addExpenseRecords();
    expenseService.searchMerchantWiseAcc.and.returnValue(of(okResponse()));
    component.searchMerchants(query, 0, false);
    expect(component.expenseDetails.controls[0].get('accountId').value).toEqual({});
  });
});
