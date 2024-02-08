import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {ConfirmationService} from 'primeng/api';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {animate, style, transition, trigger} from '@angular/animations';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';

@Component({
  selector: 'app-credit-card-upload',
  templateUrl: './credit-card-upload.component.html',
  styleUrls: ['./credit-card-upload.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('300ms ease', style({opacity: 1, transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({opacity: 0, transform: 'translateX(-100%)'})),
      ])
    ])
  ]
})
export class CreditCardUploadComponent implements OnInit {

  public formGroup: UntypedFormGroup;
  public attachment;
  public isThirdStepVisible = false;
  public isThirdStep = false;
  public isSecondStep = true;
  public employeeList = new DropdownDto();
  public headerList = new DropdownDto();
  public formatList = new DropdownDto();
  public detectedFields = new DropdownDto();
  public cards = new DropdownDto();
  public fields: any[] = [1];
  public loadingFinalize = false;
  public loadNext = false;
  public headers: any;
  public records: any = [];
  public uploadLoading = false;
  public cardWiseTransactionList = [];
  public transactionId: any;
  public addNewCard = false;


  @Output() uploadSuccess = new EventEmitter();
  cardResults: any;

  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public notificationService: NotificationService, public billsService: BillsService,
              public automationService: AutomationService, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService, public expenseService: ExpenseService) {
    this.formGroup = this.formBuilder.group({
      fourDigitsColumn: [AppConstant.NULL_VALUE],
      statementId: [AppConstant.NULL_VALUE],
      employee: [AppConstant.NULL_VALUE],
      headerRow: [AppConstant.NULL_VALUE],
      dateFormat: [],
      attachment: [AppConstant.NULL_VALUE],
      cardNo: [AppConstant.NULL_VALUE, Validators.compose([Validators.minLength(4)])],
      transactionDateColumn: [AppConstant.NULL_VALUE, Validators.required],
      postingDateColumn: [AppConstant.NULL_VALUE],
      merchantColumn: [AppConstant.NULL_VALUE],
      descriptionColumn: [AppConstant.NULL_VALUE],
      amountColumn: [AppConstant.NULL_VALUE, Validators.required],
      groupedCardList: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.formGroup.get(AppFormConstants.EMPLOYEE).valueChanges.subscribe((val) => this.employeeChanged(val));
    this.formGroup.get(AppFormConstants.CARD_NO).valueChanges.subscribe((val) => this.employeeChanged(val));
    this.formGroup.get(AppFormConstants.FOUR_DIGITS_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.TRANSACTION_DATE_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.POSTING_DATE_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.MERCHANT_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.DESCRIPTION_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.AMOUNT_COLUMN).valueChanges.subscribe((val) => this.fourDigitChanged(val));
    this.formGroup.get(AppFormConstants.HEADER_ROW).valueChanges.subscribe(() => {

      this.uploadLoading = true;
      this.attachment = null;
      this.readFileData().then(() => {
        this.uploadLoading = false;
        this.attachment = this.formGroup.get(AppFormConstants.ATTACHMENT).value;
        this.formGroup.get(AppFormConstants.TRANSACTION_DATE_COLUMN).reset();
        this.formGroup.get(AppFormConstants.POSTING_DATE_COLUMN).reset();
        this.formGroup.get(AppFormConstants.MERCHANT_COLUMN).reset();
        this.formGroup.get(AppFormConstants.DESCRIPTION_COLUMN).reset();
        this.formGroup.get(AppFormConstants.AMOUNT_COLUMN).reset();
        this.formGroup.get(AppFormConstants.FOUR_DIGITS_COLUMN).reset();
        this.formGroup.get(AppFormConstants.GROUP_CARD_LIST).reset();
        this.validateDataForThirdStep();
      });
    });
    this.getDateFormats().then(() => this.formGroup.get(AppFormConstants.DATE_FORMAT).patchValue(AppConstant.US_DATE_FORMAT));
    this.getEmployees();
    this.getExistingCards();
    this.initHeaders();
  }

  get f() {
    return this.formGroup.controls;
  }

  getExistingCards() {
    this.expenseService.getExistingCards(true, true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.cards.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_CREATE)) {
          this.cards.data.splice(0, 0, {id: -1, name: 'Add New'});
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get date formats
   */
  getDateFormats() {
    return new Promise<void>(resolve => {
      this.billSubmitService.getDateFormats().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.formatList.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * Get user list
   */
  getEmployees() {
    this.automationService.getApprovalUserList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.employeeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Add values to header dropdown
   */
  initHeaders() {
    this.headerList.data = [
      {id: 1, name: 'Row One'},
      {id: 2, name: 'Row Two'},
      {id: 3, name: 'Row Three'},
      {id: 4, name: 'Row Four'},
      {id: 5, name: 'Row Five'}
    ];
    this.formGroup.get(AppFormConstants.HEADER_ROW).patchValue(1);
  }


  /**
   * On file upload click
   * @param id
   */
  fileUploadClick(id) {
    if (this.uploadLoading) {
      return;
    }
    document.getElementById(id).click();
  }

  /**
   * Triggers when dragging over file upload
   * to prevent default browser actions
   * @param ev
   */
  dragOverHandler(ev) {
    ev.preventDefault();
  }

  /**
   * File added
   * @param ev
   */
  fileAdded(ev: any) {
    if (this.uploadLoading) {
      return;
    }
    if (ev.target.files[0]) {
      this.validateAndPatchFile(ev.target.files[0]);
    }
  }

  /**
   * Triggers when file is drop to drop zone
   * @param ev
   */
  fileDropped(ev) {
    ev.preventDefault();
    if (this.uploadLoading) {
      return;
    }
    if (ev?.dataTransfer?.items) {
      if (ev.dataTransfer.items.length > 1) {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_LIMIT_ONE);
        return;
      }
      if (ev.dataTransfer.items[0].kind === 'file') {
        this.validateAndPatchFile(ev.dataTransfer.items[0].getAsFile());
      }
    }
  }

  /**
   * Validate the file and send to backend
   * @param file
   */
  async validateAndPatchFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.notificationService.infoMessage(HttpResponseMessage.FILE_TYPE_ONLY_CSV);
      return;
    }
    if ((file.size / 1024 / 1024) > 25) {
      this.notificationService.infoMessage(HttpResponseMessage.FILE_SIZE_EXCEED);
      return;
    }
    this.formGroup.get(AppFormConstants.ATTACHMENT).patchValue(file);
    this.uploadLoading = true;
    await this.readFileData().then((r) => {
      this.attachment = file;
      this.uploadLoading = false;
    }).catch(() => {
      this.uploadLoading = false;
    });
  }


  /**
   * Read file after user uploads
   */
  readFileData() {
    return new Promise<void>((resolve, reject) => {
      const headerRow = this.formGroup.get(AppFormConstants.HEADER_ROW).value;
      if (!this.formGroup.get(AppFormConstants.ATTACHMENT).value || !headerRow) {
        resolve();
        return;
      }
      this.detectedFields = new DropdownDto();
      this.records = [];
      this.headers = [];
      this.billsService.uploadCreditCardStatement(this.formGroup.get(AppFormConstants.ATTACHMENT).value, headerRow).then((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.records = res.body.records;
          this.headers = Object.keys(this.records[0]);
          this.headers?.forEach((val, index) => {
            this.detectedFields.data.push({id: index + 1, name: `Column ${index + 1} : ${val}`});
          });
          this.formGroup.get(AppFormConstants.STATEMENT_ID).patchValue(res.body.statementId);
          resolve();
        } else {
          this.notificationService.infoMessage(res.body.message);
          reject();
        }
      }, error => {
        reject();
        this.notificationService.errorMessage(error);
      });
    });

  }

  /**
   * Reset the whole form
   */
  reset() {
    this.formGroup.reset();
    this.attachment = null;
    this.records = [];
    this.isThirdStepVisible = false;
    this.isThirdStep = false;
    this.isSecondStep = true;
    this.formGroup.get(AppFormConstants.DATE_FORMAT).patchValue(AppConstant.US_DATE_FORMAT);
    this.formGroup.get(AppFormConstants.HEADER_ROW).patchValue(1);
  }

  /**
   * Triggers when employee is changed
   * @param val employee id
   */
  private employeeChanged(val: any) {
    if (val) {
      this.columnSelectionChanged(false);
    }
  }

  /**
   * Calls when Column Selection is changed and employee changed
   * to show hide the next and finalize buttons
   */
  columnSelectionChanged(fromFourDigits) {
    if (fromFourDigits) {
      this.isThirdStepVisible = true;
      this.formGroup.get(AppFormConstants.EMPLOYEE).reset();
      this.formGroup.get(AppFormConstants.CARD_NO).reset();
    } else {
      this.formGroup.get(AppFormConstants.FOUR_DIGITS_COLUMN).reset();
      this.isThirdStepVisible = false;
    }
    this.validateDataForThirdStep();
  }

  /**
   * Triggers when four digit is changed
   * @param val employee id
   */
  private fourDigitChanged(val: any) {
    this.loadNext = true;
    if (this.formGroup.get(AppFormConstants.FOUR_DIGITS_COLUMN).value) {
      this.loadNext = true;
      this.formGroup.get(AppFormConstants.GROUP_CARD_LIST).reset();
      this.columnSelectionChanged(true);
    } else {
      this.isThirdStepVisible = false;
      this.validateDataForThirdStep();
    }
  }

  /**
   * Next and back trigger to change the buttons and animations
   */
  async nextBackTrigger() {
    if (this.isSecondStep) {
      if (!this.formGroup.valid) {
        new CommonUtility().validateForm(this.formGroup);
        return;
      }
      this.isSecondStep = false;
      setTimeout(() => {
        this.isThirdStep = true;
      }, 300);
    } else {
      this.isThirdStep = false;
      setTimeout(() => {
        this.isSecondStep = true;
      }, 380);
    }
  }


  /**
   * Triggers when header row and four digits changed
   * Get grouped data for third step
   */
  validateDataForThirdStep() {
    this.formGroup.get(AppFormConstants.GROUP_CARD_LIST).reset();

    if (!this.formGroup.get(AppFormConstants.FOUR_DIGITS_COLUMN).value) {
      this.loadNext = false;
      return;
    }

    this.billsService.validateCreditDataOnNext(this.formGroup.value).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.groupFormArray.clear();
        this.groupFormArray.reset();
        res?.body?.forEach(() => {
          this.addGroup();
        });
        this.formGroup.get(AppFormConstants.GROUP_CARD_LIST).patchValue(res.body);
        this.loadNext = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loadNext = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Return form array data
   */
  public get groupFormArray() {
    return this.formGroup.get(AppFormConstants.GROUP_CARD_LIST) as UntypedFormArray;
  }

  /**
   * Adding group arrays
   */
  addGroup() {
    const groupInfo = this.formBuilder.group({
      cardNo: [null],
      recordCount: [null],
      cardNoStr: [null],
      employee: [null],
      employeeId: [null],
      id: [null],
      statementId: [null],
      loading: [false],
    });
    this.groupFormArray.push(groupInfo);
  }

  /**
   * Run on finalize button clicked
   * Check if there are any unfilled employees in grouped list then display the confirmation
   */
  finalize() {
    if (!this.formGroup.valid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.loadingFinalize = true;
    const obj = this.formGroup.value;
    if (obj.cardNo?.id) {
      obj.cardNo = obj.cardNo.id;
    }
    this.createStatement(obj);
  }


  /**
   * Create Statement
   */
  createStatement(obj) {
    this.billsService.createCreditStatement(obj).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTIONS_CREATED_SUCCESSFULLY);
        this.reset();
        this.uploadSuccess.emit();
        this.expenseService.cardListSubject.next(true);
        this.expenseService.processListSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loadingFinalize = false;
    }, error => {
      this.loadingFinalize = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Preview a bill of the selected card No
   * @param group
   */
  previewTransaction(group) {
    if (group.value.loading) {
      return;
    }
    this.clearCardWiseTransactions();
    group.value.loading = true;

    this.expenseService.getCardWiseTransactions(group.value.cardNo, group.value.statementId).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        if (res.body.length) {
          this.cardWiseTransactionList = res.body;
          this.cardWiseTransactionList[0].cardNo = group.value.cardNoStr;
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      group.value.loading = false;
    }, error => {
      group.value.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Clear the array of card wise transaction list
   */
  clearCardWiseTransactions() {
    this.cardWiseTransactionList = [];
  }

  cardChanged(event: any) {
    if (event.value === -1) {
      this.formGroup.get(AppFormConstants.CARD_NO).reset();
      this.addNewCard = true;
    }
  }

  /**
   * Employee Dropdown Changed
   */
  employeeDpChanged(option, group: AbstractControl<any>) {
    if (!option) {
      group.get('employee').patchValue(null);
      return;
    }
    group.get('employee').patchValue(option);
  }
}
