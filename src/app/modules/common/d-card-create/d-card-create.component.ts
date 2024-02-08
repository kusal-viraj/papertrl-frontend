import {
  AfterContentInit,
  AfterViewInit,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {PurchaseOrdersService} from '../../../shared/services/vendor-community/purchase-orders.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {max} from "rxjs";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {Dropdown} from 'primeng/dropdown';
@Component({
  selector: 'app-d-card-create',
  templateUrl: './d-card-create.component.html',
  styleUrls: ['./d-card-create.component.scss']
})
export class DCardCreateComponent extends MandatoryFields implements OnInit, AfterViewInit{

  @Input() editView = false;
  @Input() poId;
  @Output() updateGrid = new EventEmitter();
  public formGroup: FormGroup;
  public employeeList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public projectList: DropdownDto = new DropdownDto();
  public vendorsList: DropdownDto = new DropdownDto();
  public vendorRelatedUsersList: DropdownDto = new DropdownDto();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public commonUtil: CommonUtility = new CommonUtility();
  public userTypeEmployee = 'E';
  public userTypeVendor = 'V';
  public userTypeNewVendor = 'N';
  public loading = false;
  public userPanel = false;
  public vendorUserPanel = false;
  public maxDate: Date;
  public today: Date;
  public AppAuthorities = AppAuthorities;
  @ViewChild('radioEmp') public radioEmp: ElementRef;

  constructor(public additionalFieldService: AdditionalFieldService, public notificationService: NotificationService,
              public formBuilder: FormBuilder, public automationService: AutomationService,
              public gaService: GoogleAnalyticsService,
              private purchaseOrdersService: PurchaseOrdersService, private privilegeService: PrivilegeService,
              public creditNoteService: CreditNoteService, private paymentService: PaymentService,
              public billsService: BillsService) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      payeeType: [this.userTypeEmployee],
      employeeId: [null, Validators.required],
      vendorUserId: [null],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      mobileNumber: [null, Validators.required],
      cardNickName: [null, Validators.required],
      amount: [null, Validators.required],
      effectiveUntil: [null, Validators.required],
      // agree: [null, [Validators.required, requireTrueValidator()]],
      poId: [null],
      accountId: [null],
      projectId: [null],
      vendorName: [null],
      contactPerson: [null],
      vendorId: [null],
      email: [null],
    });

    // function requireTrueValidator(): ValidatorFn {
    //   return (control: AbstractControl): { [key: string]: any } | null => {
    //     if (control.value === true) {
    //       return null;
    //     } else {
    //       return {requireTrue: {value: control.value}};
    //     }
    //   };
    // }

    this.getEmployees();
    this.getPoList().then(() => {
      if (this.poId) {
        this.formGroup.get('poId').patchValue(this.poId);
        this.changePo();
      }
    });
    this.getVendorList();
    this.getAccountList();
    this.getProjectList();

    this.formGroup.get('payeeType').valueChanges.subscribe(() => {
      this.userTypeChanged();
    });

    this.today = new Date(); // Get the current date
    this.today.setDate(this.today.getDate() + 1); // Add one day
    this.maxDate = new Date(this.today.getFullYear() + 1, this.today.getMonth(), this.today.getDate());
  }

  get f() {
    return this.formGroup.controls;
  }

  userTypeChanged() {
    this.formGroup.get('employeeId').reset();
    this.formGroup.get('poId').reset();
    this.formGroup.get('vendorId').reset();
    this.formGroup.get('vendorName').reset();
    this.formGroup.get('contactPerson').reset();
    this.formGroup.get('email').reset();
    this.formGroup.get('vendorUserId').reset();

    this.formGroup.get('employeeId').clearValidators();
    this.formGroup.get('poId').clearValidators();
    this.formGroup.get('vendorId').clearValidators();
    this.formGroup.get('vendorName').clearValidators();
    this.formGroup.get('contactPerson').clearValidators();
    this.formGroup.get('email').clearValidators();
    this.formGroup.get('vendorUserId').clearValidators();

    this.formGroup.get('employeeId').updateValueAndValidity();
    this.formGroup.get('poId').updateValueAndValidity();
    this.formGroup.get('vendorId').updateValueAndValidity();
    this.formGroup.get('vendorName').updateValueAndValidity();
    this.formGroup.get('contactPerson').updateValueAndValidity();
    this.formGroup.get('email').updateValueAndValidity();
    this.formGroup.get('vendorUserId').updateValueAndValidity();

    if (this.formGroup.get('payeeType').value === this.userTypeEmployee) {
      this.formGroup.get('employeeId').setValidators([Validators.required]);
    }

    if (this.formGroup.get('payeeType').value === this.userTypeVendor) {
      this.formGroup.get('vendorUserId').setValidators([Validators.required]);
      this.formGroup.get('vendorId').setValidators([Validators.required]);
    }

    if (this.formGroup.get('payeeType').value === this.userTypeNewVendor) {
      this.formGroup.get('vendorName').setValidators([Validators.required]);
      this.formGroup.get('email').setValidators([Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]);
    }
  }

  getEmployees() {
    this.automationService.getApprovalUserList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.employeeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPoList() {
    return new Promise(resolve => {
      this.purchaseOrdersService.getAllApprovedPOList().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poList.data = res.body;
          resolve(true);
        }
      }, error => {
        this.notificationService.errorMessage(error);
        resolve(true);
      });
    });
  }


  getAccountList() {
    this.billsService.getAccountList().subscribe((res: any) => {
        this.accountList.data = res;
    });
  }

  getProjectList() {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.projectList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getVendorList() {
    this.paymentService.getCommunityVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorsList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }

  changeEmployee(event: any) {
    if (event.value === 0) {
      this.userPanel = true;
      setTimeout(() => {
        this.formGroup.get('employeeId').reset();
      }, 100);
    } else if (event.value) {
      this.getEmployeeDetails(event.value);
    }
  }

  getEmployeeDetails(event: any) {
    this.paymentService.getEmployeeDetails(event).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.setName(res.body);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  setName(result): void {
    this.formGroup.get('firstName').reset();
    this.formGroup.get('lastName').reset();
    this.formGroup.get('mobileNumber').reset();
    this.formGroup.get('mobileNumber').patchValue(result.telephoneNo);
    const nameParts = result.name.split(' ');
    this.formGroup.get('firstName').patchValue(nameParts.shift());
    this.formGroup.get('lastName').patchValue(nameParts.join(' '));
  }

  getVendorEmployeeDetails(event: any) {
    const vendorId = this.formGroup.get('vendorId').value;
    if (!vendorId || !event) {
      return;
    }
    this.paymentService.getVendorEmployeeDetails(vendorId, event).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.setName(res.body);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  changeVendorUser(event: any) {
    if (event.value === 0) {
      this.vendorUserPanel = true;
      setTimeout(() => {
        this.formGroup.get('vendorUserId').reset();
      }, 100);
    } else if (event.value) {
      this.getVendorEmployeeDetails(event.value);
    }
  }

  changeVendor(e: any) {
    if (this.formGroup.get('vendorId').value) {
      this.getVendorRelatedUsers();
    } else {
      this.vendorRelatedUsersList = new DropdownDto();
    }
  }

  getVendorRelatedUsers() {
    const venId = this.formGroup.get('vendorId').value;
    this.paymentService.getCommunityVendorRelatedUserList(venId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorRelatedUsersList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  resetForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    const currentPayee = this.formGroup.get('payeeType').value;
    this.formGroup.reset();

    setTimeout(() => {
      this.formGroup.get('payeeType').patchValue(currentPayee);
      if (this.poId) {
        this.formGroup.get('poId').patchValue(this.poId);
      }
      this.changePo();
    }, 100);
  }

  submit() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.CREATE_CARD,
      AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
      AppAnalyticsConstants.CREATE_CARD,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.formGroup.value.mobileNumber = this.commonUtil.getTelNo(this.formGroup, 'mobileNumber');
    if (!this.formGroup.valid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }

    const card = Object.assign({}, this.formGroup.value);
    try {
      card.effectiveUntil = card.effectiveUntil.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } catch (e) {
    }
    this.loading = true;
    this.paymentService.addDCardData(card).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.notificationService.successMessage(HttpResponseMessage.DIGITAL_CARD_ADDED_SUCCESSFULLY);
          this.updateGrid.emit(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.loading = false;
      },
      error: err => {
        this.notificationService.errorMessage(err);
        this.loading = false;
      }
    });
  }

  changePo() {
    const poId = this.formGroup.get('poId').value;
    if (poId) {
      const amount = this.poList.data.find(x => x.id === poId).otherData;
      this.formGroup.get('amount').setValidators([Validators.required, Validators.compose([maxValue(amount)])]);
    } else {
      this.formGroup.get('amount').clearValidators();
      this.formGroup.get('amount').setValidators([Validators.required]);
    }

    this.formGroup.get('amount').updateValueAndValidity();

    this.formGroup.get('projectId').reset();
    this.formGroup.get('accountId').reset();

    // Function to create max value validator
    function maxValue(max): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
        const forbidden = control.value > max;
        return forbidden ? {max: {value: control.value}} : null;
      };
    }
  }

  /* This interface used to focus to first radio button*/
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.radioEmp.nativeElement.focus();
    }, 0);
  }
}
