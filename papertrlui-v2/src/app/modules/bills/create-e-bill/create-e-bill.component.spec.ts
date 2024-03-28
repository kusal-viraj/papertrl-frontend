import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {InputMaskModule} from 'primeng/inputmask';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DebugElement} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BillsModule} from '../bills.module';
import {of} from 'rxjs';
import {
  dueDate,
  falseResponse, itemNameResponse, mockBillObj, okResponse, poDropDownData,
  remainingPoCeiling,
  termResponse,
  vendorResponse,
} from '../../../shared/helpers/test-data';
import {CreateEBillComponent} from './create-e-bill.component';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';

describe('Create E bill Component', () => {
  let component: CreateEBillComponent;
  let fixture: ComponentFixture<CreateEBillComponent>;
  let el: DebugElement;
  let billSubmitService: any;
  let billService: any;
  let privilegeService: any;
  let billApprovalsService: any;

  beforeEach(async () => {
    const billSubmitServiceSpy = jasmine.createSpyObj('BillSubmitService', ['getPoCeiling',
      'getDueDate', 'editBill']);
    const billsServiceSpy = jasmine.createSpyObj('BillsService', ['getDefaultPoDrawerState',
      'getVendorList', 'getTermsList', 'getPoList', 'createEInvoice', 'createBillAsApproved']);
    const privilegeServiceSpy = jasmine.createSpyObj('PrivilegeService', ['isAuthorized']);
    const billApprovalsServiceSpy = jasmine.createSpyObj('BillApprovalsService', ['getItemName']);

    await TestBed.configureTestingModule({
      declarations: [CreateEBillComponent],
      imports: [CommonModule, ReactiveFormsModule, BillsModule,
        HttpClientTestingModule, FormsModule, RouterTestingModule, InputMaskModule,
        DropdownModule, ButtonModule, TabViewModule, ConfirmDialogModule, OverlayPanelModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSubmitService, useValue: billSubmitServiceSpy},
        {provide: BillsService, useValue: billsServiceSpy},
        {provide: BillApprovalsService, useValue: billApprovalsServiceSpy},
        {provide: PrivilegeService, useValue: privilegeServiceSpy}
      ],
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(CreateEBillComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        billService = TestBed.inject(BillsService);
        billSubmitService = TestBed.inject(BillSubmitService);
        privilegeService = TestBed.inject(PrivilegeService);
        billApprovalsService = TestBed.inject(BillApprovalsService);
        billSubmitService.getDueDate.and.returnValue(of(dueDate()));
        billSubmitService.getPoCeiling.and.returnValue(of(remainingPoCeiling()));
        billSubmitService.editBill.and.returnValue(of(okResponse()));
        billService.getDefaultPoDrawerState.and.returnValue(of(falseResponse()));
        billService.getVendors.and.returnValue(of(vendorResponse()));
        billService.getTermsList.and.returnValue(of(termResponse()));
        billService.getPoList.and.returnValue(of(okResponse()));
        billService.createEInvoice.and.returnValue(of(okResponse()));
        billService.createBillAsApproved.and.returnValue(of(okResponse()));
        billApprovalsService.getItemName.and.returnValue(of(itemNameResponse()));
        component.initForm();
      });
  });

  it('should create a component', function() {
    expect(component).toBeTruthy();
  });

  it('should retrieve vendor list for dropdown', function() {
    component.getVendorList();
    expect(component.vendorsList.data[0].id).toBe(1);
  });

  it('should retrieve term list for dropdown', function() {
    component.getPaymentTerms();
    expect(component.termList.data[0].id).toBe(1);
  });

  it('should get the remaining ceiling when PO is selected', fakeAsync(() => {
    component.getRemainingCeiling(1);
    expect(billSubmitService.getPoCeiling).toHaveBeenCalled();
    tick();
    expect(component.createEInvoiceForm.get(AppFormConstants.REMAINING_PO_CEILING).value).toBe(1500);
  }));

  it('should get the due date when called with date change', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(1);
    component.getDueDate('12/20/2022', false, false, false);
    expect(billSubmitService.getDueDate).toHaveBeenCalledWith('12/20/2022', component.dateFormat.DATE_FORMAT, 1, 10, '12/30/2022');
  });

  it('should get the due date when called with date from term', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(1);
    component.getDueDate('12/20/2022', true, false, false);
    expect(billSubmitService.getDueDate).toHaveBeenCalledWith('12/20/2022', component.dateFormat.DATE_FORMAT, 1, 10, '12/30/2022');
  });

  it('should get the due date when called with date from net days due', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(1);
    component.getDueDate('12/20/2022', false, true, false);
    expect(billSubmitService.getDueDate).toHaveBeenCalledWith('12/20/2022', component.dateFormat.DATE_FORMAT, 1, 10, null);
  });

  it('should get the due date when called with date from due date', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(1);
    component.getDueDate('12/20/2022', false, false, true);
    expect(billSubmitService.getDueDate).toHaveBeenCalledWith('12/20/2022', component.dateFormat.DATE_FORMAT, 1, 0, '12/30/2022');
  });

  it('should get the due date when called with date from term Other', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(10);
    component.getDueDate('12/20/2022', true, false, false);
    expect(component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).validator).toBeTruthy();
  });

  it('should get the due date when called with date from term by net 10', () => {
    component.createEInvoiceForm.get(AppFormConstants.BILL_DATE).patchValue(new Date('12/20/2022'));
    component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(10);
    component.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue('12/30/2022');
    component.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(1);
    component.getDueDate('12/20/2022', true, false, false);
    expect(component.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).validator).toBeFalsy();
  });

  it('should get the item name for item id', function() {
    component.initItemCostDistributionRecords();
    component.itemCostDistributionForms.controls[1].get('itemId').patchValue(1);
    component.getItemName(1, 1);
    expect(component.itemCostDistributionForms.controls[1].get('itemName').value).toBe('Item Name Chair');
    expect(component.itemCostDistributionForms.controls[1].get('itemNumber').value).toBe('ITM-123456');
  });

  it('should clear the item name when item id is cleared', function() {
    component.initItemCostDistributionRecords();
    component.getItemName(0, 1);
    expect(component.itemCostDistributionForms.controls[1].get('itemName').value).toBeNull();
    expect(component.itemCostDistributionForms.controls[1].get('itemNumber').value).toBeNull();
  });

  it('should clear the item name when item id is cleared when amount is present', function() {
    component.initItemCostDistributionRecords();
    component.initExpenseCostDistributionRecords();
    component.itemCostDistributionForms.controls[1].get('rate').patchValue(1500);
    component.itemCostDistributionForms.controls[1].get('poReceiptId').patchValue(1);
    component.expenseCostDistributionForms.controls[1].get('amount').patchValue(1500);
    component.expenseCostDistributionForms.controls[1].get('poReceiptId').patchValue(1);
    component.poList.data = poDropDownData;
    component.poChanged(1);
    expect(component.createEInvoiceForm.get(AppFormConstants.RECEIPT_ID).value).toBeNull();
    expect(component.itemCostDistributionForms.controls[1].get('poReceiptId').value).toBeNull();
    expect(component.expenseCostDistributionForms.controls[1].get('poReceiptId').value).toBeNull();
  });

  it('should clear po when vendor changed from dropdown', function() {
    component.vendorChanged(1, true, null);
    expect(component.createEInvoiceForm.get(AppFormConstants.PO_ID).value).toBeNull();
  });

  it('should clear the department and open add new panel when add new is clicked', function() {
    component.changedDepartment({value: 0});
    expect(component.departmentPanel).toBeTrue();
    expect(component.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).value).toBeNull();
  });

  it('should clear the department in item form and open add new panel when add new is clicked', function() {
    component.initItemCostDistributionRecords();
    component.changedDepartmentItem({value: 0}, 1);
    expect(component.departmentPanel).toBeTrue();
    expect(component.itemCostDistributionForms.controls[1].get(AppFormConstants.DEPARTMENT_ID).value).toBeNull();
  });

  it('should clear the department in account form and open add new panel when add new is clicked', function() {
    component.initExpenseCostDistributionRecords();
    component.changedDepartmentAccount({value: 0}, 1);
    expect(component.departmentPanel).toBeTrue();
    expect(component.expenseCostDistributionForms.controls[1].get(AppFormConstants.DEPARTMENT_ID).value).toBeNull();
  });

  it('should make the form invalid in submit for approval', function() {
    component.createEInvoice('SUBMIT_FOR_APPROVED', false, true, null);
    expect(component.createEInvoiceForm.valid).toBeFalse();
  });

  it('should make the form invalid in save as approved', function() {
    component.createEInvoice('SAVE_AS_APPROVED', null, false, null);
    expect(component.createEInvoiceForm.valid).toBeFalse();
  });

  it('should make the form invalid in save', function() {
    component.editView = true;
    component.createEInvoice('SUBMIT_FOR_APPROVED', null, true, null);
    expect(component.createEInvoiceForm.valid).toBeFalse();
  });

  it('should make the form valid and call the backend in submit for approval', function() {
    spyOn(component.isClickCloseButton, 'emit');
    component.createEInvoiceForm.patchValue(mockBillObj);
    component.createEInvoice('SUBMIT_FOR_APPROVED', false, true, null);
    expect(billService.createEInvoice).toHaveBeenCalled();
    expect(component.isClickCloseButton.emit).toHaveBeenCalledWith(false);
  });

  it('should make the form valid and call the backend in save as approved', function() {
    spyOn(component.isClickCloseButton, 'emit');
    component.createEInvoiceForm.patchValue(mockBillObj);
    component.createEInvoice('SAVE_AS_APPROVED', null, false, null);
    expect(billService.createBillAsApproved).toHaveBeenCalled();
    expect(component.isClickCloseButton.emit).toHaveBeenCalledWith(false);
  });

  it('should make the form valid and call the backend in save', function() {
    spyOn(component.isClickCloseButton, 'emit');
    component.editView = true;
    component.createEInvoiceForm.patchValue(mockBillObj);
    component.createEInvoice('SUBMIT_FOR_APPROVED', null, true, null);
    expect(billSubmitService.editBill).toHaveBeenCalled();
    expect(component.isClickCloseButton.emit).toHaveBeenCalledWith(false);
  });

  it('should reset the form in create screen', function() {
    spyOn(component, 'clearAutomation');
    spyOn(component, 'initExpenseCostDistributionRecords');
    spyOn(component, 'initItemCostDistributionRecords');
    component.createEInvoiceForm.patchValue(mockBillObj);
    component.resetEInvoiceForm(true);
    expect(component.createEInvoiceForm.valid).toBeFalse();
    expect(component.clearAutomation).toHaveBeenCalled();
    expect(component.initExpenseCostDistributionRecords).toHaveBeenCalled();
    expect(component.initItemCostDistributionRecords).toHaveBeenCalled();
  });

  it('should reset the form and call get data method in edit screen', function() {
    spyOn(component, 'clearAutomation');
    spyOn(component, 'initExpenseCostDistributionRecords');
    spyOn(component, 'initItemCostDistributionRecords');
    spyOn(component, 'getBillData');
    component.createEInvoiceForm.patchValue(mockBillObj);
    component.editView = true;
    component.resetEInvoiceForm(true);
    expect(component.clearAutomation).toHaveBeenCalled();
    expect(component.initExpenseCostDistributionRecords).toHaveBeenCalled();
    expect(component.initItemCostDistributionRecords).toHaveBeenCalled();
    expect(component.getBillData).toHaveBeenCalled();
  });
});
