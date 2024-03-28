import {Component, Input, OnInit, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormGroup} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PoService} from '../../../shared/services/po/po.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppConstant} from '../../../shared/utility/app-constant';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {BillUtility} from '../../bills/bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {Dropdown} from "primeng/dropdown";
import {AutomationService} from '../../../shared/services/automation-service/automation.service';

@Component({
  selector: 'app-bill-header-section',
  templateUrl: './bill-header-section.component.html',
  styleUrls: ['./bill-header-section.component.scss']
})
export class BillHeaderSectionComponent implements OnInit, AfterViewInit {
  @Input() createEInvoiceForm: UntypedFormGroup;
  @Input() fromRecurringBill = false;
  @Input() vendorsList: DropdownDto = new DropdownDto();
  @Input() poList: DropdownDto = new DropdownDto();
  @Input() department: DropdownDto = new DropdownDto();
  @Input() fromCreditCard = false;
  @Input() termList: DropdownDto = new DropdownDto();
  @Input() receiptList: DropdownDto = new DropdownDto();
  @Input() headerAdditionalFieldDetails: AdditionalFieldDetailDto[];
  @Input() headingSectionArray: UntypedFormArray;
  @Input() poStatus: any;
  @Input() isClosedPO = false;
  @Input() projectTasks: DropdownDto = new DropdownDto();
  @Input() customerInvoiceList: DropdownDto = new DropdownDto();
  @Output() addDepartmentEmit = new EventEmitter();
  @Output() vendorAddNew = new EventEmitter();
  @Output() formatDateHeadingSectionEmit = new EventEmitter();
  @Output() addNewAdditionalDropDownOptionEmit = new EventEmitter();
  @Output() dueDate = new EventEmitter();
  @Output() termChange = new EventEmitter();
  @Output() vendorChange = new EventEmitter();
  @Output() projectCodeChange = new EventEmitter();
  @Output() departmentChange = new EventEmitter();
  @Output() paymentTermChange = new EventEmitter();
  @Output() billDateChange = new EventEmitter();
  @Output() updatedProjectCodeList = new EventEmitter();
  @Output() updatedCustomerInvoiceList = new EventEmitter();
  @Output() additionalFieldAddNew = new EventEmitter();
  @ViewChild('selectedVendorName') public selectedVendorName: Dropdown;

  public removeSpace: RemoveSpace = new RemoveSpace();
  public appFormConstants = AppFormConstants;
  public showPoLineItemsByDefault: any;
  public isValidDiscountDate = false;
  public appConstant: AppConstant = new AppConstant();
  public commonUtil = new CommonUtility();
  public appFieldType = AppFieldType;
  public appAuthorities = AppAuthorities;
  public isAddNewProjectCodes: boolean;
  public isCreateInvoice: boolean;

  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  constructor(public billPaymentService: BillPaymentService, public creditNoteService: CreditNoteService,
              public billsService: BillsService, public privilegeService: PrivilegeService,
              public sanitizer: DomSanitizer, public drawerService: ManageDrawerService,
              public notificationService: NotificationService, public poService: PoService,
              public automationService: AutomationService) {
  }

  ngOnInit(): void {

  }

  get bill() {
    return this.createEInvoiceForm.controls;
  }

  /**
   * This method will get trigger when on key up discount days field
   */
  onKeyUpDiscountDaysDue() {
    this.isValidDiscountDate = false;
    // tslint:disable-next-line:radix
    const netDaysDue = parseInt(this.createEInvoiceForm.get('netDaysDue').value);
    // tslint:disable-next-line:radix
    const discountDaysDue = parseInt(this.createEInvoiceForm.get('discountDaysDue').value);
    if (netDaysDue === null && discountDaysDue === null) {
      return;
    }
    if (netDaysDue < discountDaysDue) {
      this.isValidDiscountDate = true;
    } else {
      this.isValidDiscountDate = false;
      this.createEInvoiceForm.get('discountDaysDue').clearValidators();
    }
    this.createEInvoiceForm.get('discountDaysDue').updateValueAndValidity();
    this.createEInvoiceForm.get('netDaysDue').updateValueAndValidity();
  }

  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName?.value[0] === AppConstant.EMPTY_SPACE) {
      controlName.patchValue(AppConstant.EMPTY_STRING);
    }
  }

  addDepartment() {
    this.addDepartmentEmit.emit();
  }

  changeVendorList() {
    this.vendorAddNew.emit();
  }

  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl, multiSelect1: any) {
    this.addNewAdditionalDropDownOptionEmit.emit({event, additionalFieldDetailDto, additionalField, multiSelect1});
    return null;
  }

  formatDateHeadingSection(event: any, i: number) {
    this.formatDateHeadingSectionEmit.emit({event, i});
  }

  getDueDate(data, fromTerm, fromNet, fromDue) {
    this.dueDate.emit({data, fromTerm, fromNet, fromDue});
  }

  termManuallyChanged() {
    this.termChange.emit();
    this.paymentTermChange.emit();
  }

  billDateChanged() {
    this.billDateChange.emit();
  }

  vendorChanged(event, selectedVendorName) {
    this.vendorChange.emit(event);
    this.commonUtil.isPressEnterInsideDropdown(selectedVendorName);
  }

  projectCodeChanged() {
    this.projectCodeChange.emit();
  }

  departmentChanged() {
    this.departmentChange.emit();
  }


  /**
   * Returns true if the specified control has the 'required' validator and false otherwise.
   * @param form The form that contains the control to check.
   * @param field The name of the control to check.
   */
  isAsteriskMarkShown(form, field): boolean {
    const controller = form[field];
    if (!controller.validator) {
      return false;
    }
    const validator = controller.validator({} as AbstractControl);
    return (validator && validator.required);
  }

  /**
   * this interface use to focus the component in the form
   */
  ngAfterViewInit() {
    this.selectedVendorName.focus();
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */

  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto[]) {
    this.headerAdditionalFieldDetails = additionalFieldDetailDto;
  }

  /**
   * This method is use opent to add new drop down option drawer
   */

  addNewDropdownField(field: any) {
    this.additionalFieldAddNew.emit(field);
  }
}
