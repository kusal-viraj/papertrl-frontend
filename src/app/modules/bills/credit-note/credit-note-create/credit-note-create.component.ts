import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ConfirmationService} from 'primeng/api';
import {RemoveSpace} from '../../../../shared/helpers/remove-space';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {DataFormatToISODate} from '../../../../shared/utility/data-format-toISODate';
import {BillUtility} from '../../bill-utility';
import {BillPaymentService} from '../../../../shared/services/bill-payment-service/bill-payment.service';
import {AdditionalFieldDetailDto} from '../../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../../shared/enums/app-document-type';
import {PatternValidator} from '../../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../../shared/enums/app-pattern-validations';
import {CreditNoteItemDetail} from '../../../../shared/dto/credit-note/credit-note-item-detail';
import {FormGuardService} from '../../../../shared/guards/form-guard.service';
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {DomSanitizer} from '@angular/platform-browser';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {ManageDrawerService} from '../../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {BillApprovalsService} from '../../../../shared/services/bills/bill-approvals.service';
import {GoogleAnalyticsService} from "../../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../../shared/enums/app-analytics-constants";
import {Dropdown} from "primeng/dropdown";
import {PoUtility} from "../../../purchase-order/po-utility";
import {AccountNumberPopulationLineLevel} from "../../../../shared/utility/account-number-population-line-level";

@Component({
  selector: 'app-credit-note-create',
  templateUrl: './credit-note-create.component.html',
  styleUrls: ['./credit-note-create.component.scss']
})
export class CreditNoteCreateComponent implements OnInit {
  public createCreditNoteForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public skuDropDownList: DropdownDto [] = [];
  public itemDetails: any [] = [];
  public lineAccountDetails: any [] = [];
  public files: File[] = [];
  public creditNoteAttachments: any [] = [];
  public billPaymentUtility: BillUtility;
  public commonUtil = new CommonUtility();
  public creditNoteDtoForUpdate: any;
  public creditNoteDto: any = {};
  public vendorList: DropdownDto = new DropdownDto();
  public departments: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public additionalFieldLineItemDetails: AdditionalFieldDetailDto[] = new Array();
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public existAdditionalFieldAttachments: any [] = [];
  public appFieldType = AppFieldType;
  public appConstant = new AppConstant();
  public enums = AppEnumConstants;
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  public panel = false;
  public editView = false;
  public itemIndex: number;
  public accountIndex: number;
  public selectedItemIndex: number;
  public selectedVendorId: any;
  public addVendorPanel = false;
  public addNewAccount = false;
  public addNewItemOverlay = false;
  public departmentPanel = false;
  public poId = 0;
  public isSubmit = false;
  public vendorEmail: any;
  public triggerEditOption = false;
  public loading = false;
  public addNewDropDown = false;

  //Credit Card draft related variables
  public isSaveAsDraft = false;
  public isOverrideData = false;
  public tempItemDetailListInEdit: any [] = [];
  public tempAccountDetailListInEdit: any [] = [];
  public responsePOId: number;
  public isVisibleNotificationContent = false;
  public purchaseOrderStatus: any;
  public draftId: any;
  public isDraftNameAvailable = false;
  public userAvailableDraftList: any [] = [];
  public isShowDraftListPopUp = false;
  public isClickedEditButtonFromDraftList = false;
  public selectedIndexFromDraft: number;
  public appAuthorities = AppAuthorities;
  public addNewUOM = false;
  public poUtility: PoUtility;

  @Output() closeEditView = new EventEmitter();
  @Output() emitSuccess = new EventEmitter();
  @Output() emitUpdateSuccess = new EventEmitter();
  @Input() creditNoteId: any;
  @Input() isEdit = false;
  @Input() isCreate = false;
  @Input() isDetailView = false;
  @Input() isFromPoList = false;
  @Input() vendorId: any;
  @Input() purchaseOrderId: any;
  @Input() creditNoteStatus: any;
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  @ViewChild('dpNameVendor') public dpNameVendor: Dropdown;

  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );

  constructor(public formBuilder: UntypedFormBuilder, public privilegeService: PrivilegeService,
              public billApprovalsService: BillApprovalsService, public gaService: GoogleAnalyticsService,
              public creditNoteService: CreditNoteService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public billPaymentService: BillPaymentService, public cdref: ChangeDetectorRef,
              public additionalFieldService: AdditionalFieldService, public formGuardService: FormGuardService, public billsService: BillsService,
              public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {

  }


  ngOnInit(): void {
    this.billPaymentUtility = new BillUtility(this.billPaymentService, this.notificationService,
      this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
    this.initializeFormGroup();
    if (!this.isEdit) {
      this.showAvailableDraftListPopUp();
      this.initAddItems();
      this.initAddAccounts();
      this.getModuleReheatedAdditionalField(AppDocumentType.CREDIT_NOTE, false);
    } else {
      this.getCreditNoteData(this.creditNoteId);
    }
    if (this.isFromPoList) {
      if (!this.vendorId && !this.purchaseOrderId) {
        return;
      } else {
        this.poId = this.purchaseOrderId;
        this.changeVendorList(this.vendorId);
        this.createCreditNoteForm.get('vendorId').patchValue(this.vendorId);
        this.createCreditNoteForm.get('poId').patchValue(this.purchaseOrderId);
        this.getPORelatedItemDetails(this.purchaseOrderId);
      }
    }
    this.getVendorList(this.vendorList);
    this.getDepartment();
    this.getAccounts(this.accountList);
  }


  // ----------------------Account Related Changes------------------------------------------>

  /**
   * Retrieves the account details controllers as a form array.
   */
  public get accountDetails() {
    return this.createCreditNoteForm.get('creditNoteAccountDetails') as UntypedFormArray;
  }

  /**
   * Handles the click event on an account.
   * @param index - The index of the clicked account.
   */
  onAccountClick(index) {
    if (this.poId) {
      return;
    }
    const lastIndex = this.accountDetails.length - 1;
    if (lastIndex === index) {
      this.addAccount();
      this.addAccountFields(lastIndex);
    }
  }


  /**
   * This method use for add new form controller group for automation condition
   */
  addAccountFieldOnClick() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      description: [null],
      amount: [null],
      creditNoteBalance: [null],
      outstandingAmount: [null],
      accountNumber: [null],
      isInvalidLine: [false],
      poAccountDetailId: [null],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
    const len = (this.accountDetails.length - 2);
    this.addAccountFields(len);
  }


  /**
   * Adds additional field items to a specific account.
   * @param index - The index of the account.
   */
  addAccountFields(index) {
    this.accountAdditionalFieldDetails.forEach((value) => {
      this.accountAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /**
   * Retrieves the additional detail controllers of a specific account as a form array.
   * @param index - The index of the account.
   */
  public accountAdditionalField(index) {
    return this.accountDetails.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * Adds a new account to the form controller group for automation condition.
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      description: [null],
      amount: [null],
      creditNoteBalance: [null],
      outstandingAmount: [null],
      isInvalidLine: [false],
      poAccountDetailId: [null],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.billsService.getAccountList(this.editView).subscribe((res: any) => {
      listInstance.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Retrieves the account name for a specific value and updates the corresponding accountName control.
   * @param value - The value to get the account name for.
   * @param i - The index of the account in the accountDetails array.
   */
  getAccountName(value, i: any) {
    if (!isNotNullOrUndefined(value)) {
      this.accountDetails.controls[i].get('accountName').reset();
      return;
    }
    if (value === AppConstant.ZERO) {
      this.accountDetails.controls[i].get('accountId').reset();
      this.addNewAccount = true;
      return;
    } else {
      this.billApprovalsService.getAccountName(value).subscribe(
        (res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.accountDetails.controls[i].get('accountName').patchValue(res.body.name);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        },
        (error) => {
          this.notificationService.errorMessage(error);
        }
      );
    }
  }


  /**
   * Removes an account at a specific index from the accountDetails array.
   * @param i - The index of the account to remove.
   */
  removeAccount(i: any) {
    this.accountDetails.removeAt(i);
    this.calculateTotal();
  }

  // ---------------------------------------------------------------->

  /**
   * Retrieves the department data and updates the dropdown instance.
   */
  getDepartment() {
    this.billsService.getDepartment(!this.editView).subscribe((res: any) => {
      this.departments.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_CREATE)) {
        this.departments.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method used to get vendor related item list
   */
  getVendorItemList(selectedVendorId) {
    if (!selectedVendorId) {
      this.vendorRelevantItemList = new DropdownDto();
      return;
    } else {
      this.billsService.getItemListByVendorId(selectedVendorId, !this.editView).subscribe((res: any) => {
        this.vendorRelevantItemList.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList(dropDownInstance: DropdownDto) {
    this.billsService.getVendorList(!this.isEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        dropDownInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to initialize the form group
   */
  initializeFormGroup() {
    this.createCreditNoteForm = this.formBuilder.group({
      id: [null],
      creditNoteNo: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      creditNoteDate: [null, Validators.compose([Validators.required])],
      vendorId: [null, Validators.compose([Validators.required])],
      vendorEmail: [AppConstant.NULL_VALUE, [Validators.compose([Validators.maxLength(150),
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      comment: [AppConstant.NULL_VALUE],
      creditNoteItemDetails: this.formBuilder.array([]),
      creditNoteAccountDetails: this.formBuilder.array([]),
      itemGrossAmount: [AppConstant.NULL_VALUE],
      totalCredit: [AppConstant.NULL_VALUE],
      taxAmount: [AppConstant.NULL_VALUE],
      total: [AppConstant.NULL_VALUE],
      attachments: [AppConstant.NULL_VALUE],
      poId: [AppConstant.NULL_VALUE],
      subTotal: [AppConstant.NULL_VALUE],
      additionalData: this.formBuilder.array([])
    });
  }

  /**
   * this method can be used for submit credit note form
   * @param value to form value
   */
  submitCreditNote(value) {
    if (this.isEdit && this.isDraft()) {
      this.isSubmit = true;
      this.updateCreditNote();
      return;
    }
    this.isSubmit = true;
    if (this.createCreditNoteForm.invalid) {
      this.isSubmit = false;
      new CommonUtility().validateForm(this.createCreditNoteForm);
    } else {
      this.formatAdditionalMultiselectField();
      this.creditNoteService.createCreditNote(this.creditNoteDtoForUpdate).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.gaService.trackScreenButtonEvent(
            AppAnalyticsConstants.CREATE_CREDIT_NOTE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE ,
            AppAnalyticsConstants.CREATE_CREDIT_NOTE,
            AppAnalyticsConstants.CREATE_SCREEN
          );
          this.isSubmit = false;
          this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_CREATED_SUCCESSFULLY);
          this.resetCreditNoteForm(true);
          this.emitSuccess.emit();
        } else {
          this.isSubmit = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isSubmit = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used for update credit note form
   */
  updateCreditNote() {
    this.triggerEditOption = true;
    this.commonUtil.validateFileInput(this.createCreditNoteForm.get('additionalData'), this.creditNoteAttachments);
    if (this.createCreditNoteForm.invalid) {
      this.triggerEditOption = false;
      this.isSubmit = false;
      new CommonUtility().validateForm(this.createCreditNoteForm);
    } else {
      this.formatAdditionalMultiselectField();
      this.creditNoteService.updateCreditNote(this.createCreditNoteForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {

          this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_UPDATED_SUCCESSFULLY);
          this.triggerEditOption = false;
          this.isSubmit = false;
          this.closeEditView.emit();
          this.emitUpdateSuccess.emit();
        } else {
          this.triggerEditOption = false;
          this.isSubmit = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isSubmit = false;
        this.triggerEditOption = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method format id array to string variable before request to back end
   */
  formatAdditionalMultiselectField() {
    this.creditNoteDtoForUpdate = this.createCreditNoteForm.value;
    const creditNoteDate = this.createCreditNoteForm.get('creditNoteDate').value;
    if (creditNoteDate) {
      this.creditNoteDtoForUpdate.creditNoteDate = creditNoteDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
    this.creditNoteDtoForUpdate.additionalData = this.commonUtil.formatMultisetValues(this.creditNoteDtoForUpdate.additionalData);
    this.creditNoteDtoForUpdate.creditNoteItemDetails = this.commonUtil.formatMultisetLineValues(this.creditNoteDtoForUpdate.creditNoteItemDetails);
    this.creditNoteDtoForUpdate.creditNoteAccountDetails = this.commonUtil.formatMultisetLineValues(this.creditNoteDtoForUpdate.creditNoteAccountDetails);
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.createCreditNoteForm.get('creditNoteItemDetails') as UntypedFormArray;
  }


  /**
   * this method can be used for navigate
   * @param e to event
   * @param name to element id
   * @param i to index number
   */
  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.lineItemMainTable.length) - 2 === i && !this.poId) {
          this.addItemOnclickLink();
        }
        e.preventDefault();
        document.getElementById(name + (i + AppConstant.ONE)).focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (i !== AppConstant.ZERO) {
          document.getElementById(name + (i - AppConstant.ONE)).focus();
        }
        break;
    }
  }

  /**
   * this method can be used to add line item on click
   */
  addItemOnclickLink() {
    const itemInfo = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      productId: [AppConstant.NULL_VALUE],
      vendorItemNumber: [AppConstant.NULL_VALUE],
      itemName: [AppConstant.NULL_VALUE],
      qty: [AppConstant.NULL_VALUE],
      itemNumber: [AppConstant.NULL_VALUE],
      accountId: [AppConstant.NULL_VALUE],
      accountNumber: [AppConstant.NULL_VALUE],
      uomId: [AppConstant.NULL_VALUE],
      unitPrice: [AppConstant.NULL_VALUE],
      departmentId: [AppConstant.NULL_VALUE],
      description: [AppConstant.NULL_VALUE],
      discountAmount: [AppConstant.NULL_VALUE],
      amount: [AppConstant.NULL_VALUE],
      departmentName: [AppConstant.NULL_VALUE],
      uomName: [AppConstant.NULL_VALUE],
      poDetailId: [AppConstant.NULL_VALUE],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    this.lineItemMainTable.push(itemInfo);
    const len = (this.lineItemMainTable.length) - 2;
    this.addAdditionalLineItems(len);
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.lineItemMainTable.removeAt(itemIndex);
    this.calculateTotal();
  }

  /**
   * calculate amount
   * @param index to item detail index number
   */
  calculateAmount(index) {
    this.itemIndex = index;
    if (this.lineItemMainTable.controls.length > 0) {
      const lineAmount: number = (!this.lineItemMainTable?.controls[index]?.value.unitPrice) ? 0.00 :
        this.lineItemMainTable.controls[index].value.unitPrice;

      const qty: number = (!this.lineItemMainTable?.controls[index]?.value.qty) ? 0.00 :
        this.lineItemMainTable?.controls[index]?.value.qty;
      const total: number = parseFloat((qty * lineAmount) + AppConstant.EMPTY_STRING);

      this.lineItemMainTable.controls[index]?.get('amount')?.patchValue(total);
    }

    if (this.poId && this.accountDetails.controls.length > 0) {
      const accountAmount: number = (!this.accountDetails?.controls[index]?.value.amount) ? 0.00 :
        this.accountDetails?.controls[index]?.value.amount;

      const creditNoteBalance: number = (!this.accountDetails?.controls[index]?.value.creditNoteBalance) ? 0.00 :
        this.accountDetails.controls[index].value.creditNoteBalance;
      if (creditNoteBalance >= accountAmount) {
        this.accountDetails.controls[index].get('outstandingAmount').patchValue(parseFloat('' + (creditNoteBalance - accountAmount)));
        this.accountDetails.controls[index].get('isInvalidLine').patchValue(false);
      } else {
        this.accountDetails.controls[index].get('outstandingAmount').patchValue(parseFloat('' + creditNoteBalance));
        this.accountDetails.controls[index].get('isInvalidLine').patchValue(true);

      }
    }
    this.calculateTotal();
  }

  /**
   * Calculates the total amount for the credit note.
   */
  calculateTotal() {
    let totalLineItemAmount = 0.0;
    let totalLineAccountAmount = 0.0;
    let totalCreditAmount;
    let taxAmount;

    // Calculate total line item amount
    const itemDetails: CreditNoteItemDetail[] = this.lineItemMainTable.value;
    itemDetails.forEach((value, i) => {
      if (value.unitPrice !== undefined && value.qty !== undefined) {
        totalLineItemAmount += value.unitPrice * value.qty;

        // Update amount field if from PO list
        if (this.isFromPoList) {
          let total = 0.0;
          total = value.unitPrice * value.qty;
          this.lineItemMainTable.controls[i].get('amount').patchValue(total);
        }
      }
    });

    // Calculate total line account amount
    this.accountDetails.value.forEach((value, i) => {
      if (value.amount !== undefined) {
        totalLineAccountAmount += value.amount;
      }
    });

    // Calculate total credit amount
    taxAmount = this.createCreditNoteForm.get('taxAmount').value;
    totalCreditAmount = totalLineItemAmount + taxAmount + totalLineAccountAmount;

    // Update form fields
    this.createCreditNoteForm.get('subTotal').patchValue(totalLineItemAmount + totalLineAccountAmount);
    this.createCreditNoteForm.get('totalCredit').patchValue(totalCreditAmount);
  }

  /**
   * This method use for get item name by item id
   * @param event to change event
   * @param index number to selected array row index number
   */
  patchItemName(event: any, index) {
    this.selectedItemIndex = index;
    this.lineItemMainTable.controls[index].get('itemNumber').reset();
    this.lineItemMainTable.controls[index].get('itemName').reset();
    this.lineItemMainTable.controls[index].get('unitPrice').reset();
    this.lineItemMainTable.controls[index].get('qty').reset();
    this.lineItemMainTable.controls[index].get('uomId').reset();
    this.lineItemMainTable.controls[index].get('departmentId').reset();
    this.lineItemMainTable.controls[index].get('discountAmount').reset();

    if (event.value !== AppConstant.ZERO && event.value) {
      this.lineItemMainTable.controls[index].get('vendorItemNumber').reset();
      this.getItemRelatedSku(this.selectedVendorId, event.value, index);
      this.creditNoteService.getItemName(event.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.lineItemMainTable.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
          this.lineItemMainTable.controls[index].get('itemName').patchValue(res.body.name);
          // this.lineItemMainTable.controls[index].get('unitPrice').patchValue(res.body.salesPrice);
          this.lineItemMainTable.controls[index].get('uomId').patchValue(res.body.uomId);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else if (event.value === AppConstant.ZERO) {
      this.cdref.detectChanges();
      this.lineItemMainTable.controls[index].reset();
      this.addNewItemOverlay = true;
    } else {
      this.lineItemMainTable.controls[index].reset();
    }

  }

  /**
   * get item related sku
   * @param venId to vendor id
   * @param itemId to item master id
   * @param index to index number
   */
  getItemRelatedSku(venId, itemId, index) {
    if (itemId === null || itemId === undefined) {
      return;
    } else {
      this.creditNoteService.getItemRelatedSKU(venId, itemId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.skuDropDownList[index].data = res.body;
          this.calculateAmount(index);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }

      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName?.value[AppConstant.ZERO] === AppConstant.EMPTY_SPACE) {
      controlName.patchValue(AppConstant.EMPTY_STRING);
    }
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    if (this.poId) {
      return;
    } else {
      const len = (this.lineItemMainTable.length) - 1;
      if (len === index) {
        this.addItem();
        const obj: DropdownDto = new DropdownDto();
        this.skuDropDownList.push(obj);
        this.addAdditionalLineItems(len);
      }
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addAdditionalLineItems(index) {
    this.additionalFieldLineItemDetails.forEach((value) => {
      this.itemDetailsAdditionalFields(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }


  /**
   * this method can be used to init add items
   */
  initAddItems() {
    for (let i = AppConstant.ZERO; i < AppConstant.INITIAL_ITEM_DETAIL_COUNT; i++) {
      this.addItem();
    }
  }

  /**
   * this method can be used to init add accounts
   */
  initAddAccounts() {
    for (let i = AppConstant.ZERO; i < AppConstant.INITIAL_ITEM_DETAIL_COUNT; i++) {
      this.addAccount();
    }
  }


  /**
   * this method can be used to add line item on click
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      productId: [AppConstant.NULL_VALUE],
      vendorItemNumber: [AppConstant.NULL_VALUE],
      itemName: [AppConstant.NULL_VALUE],
      qty: [AppConstant.NULL_VALUE],
      itemNumber: [AppConstant.NULL_VALUE],
      uomId: [AppConstant.NULL_VALUE],
      accountId: [AppConstant.NULL_VALUE],
      accountNumber: [AppConstant.NULL_VALUE],
      unitPrice: [AppConstant.NULL_VALUE],
      departmentId: [AppConstant.NULL_VALUE],
      description: [AppConstant.NULL_VALUE],
      discountAmount: [AppConstant.NULL_VALUE],
      amount: [AppConstant.NULL_VALUE],
      departmentName: [AppConstant.NULL_VALUE],
      uomName: [AppConstant.NULL_VALUE],
      poDetailId: [AppConstant.NULL_VALUE],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */

  onSelect(event) {
    this.files.push(...event.addedFiles);
    this.createCreditNoteForm.patchValue({
      attachments: this.files
    });
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), AppConstant.ONE);
  }

  /**
   * this method can be used to
   */
  resetCreditNoteForm(fromOverrideAction) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE ,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.files = [];
    this.additionalFieldLineItemDetails = [];
    this.headerAdditionalFieldDetails = [];
    this.vendorRelevantItemList.data = [];
    this.accountAdditionalFieldDetails = [];
    this.isDraftNameAvailable = false;
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    while (this.headingSectionArray.length !== AppConstant.ZERO) {
      this.headingSectionArray.removeAt(AppConstant.ZERO);
    }
    while (this.accountDetails.length !== AppConstant.ZERO) {
      this.accountDetails.removeAt(AppConstant.ZERO);
    }
    this.poId = null;
    this.billPaymentUtility.vendorRelatedPoList = new DropdownDto();
    this.createCreditNoteForm.reset();
    if (this.isEdit || (this.isOverrideData && fromOverrideAction)) {
      this.getCreditNoteData(this.creditNoteId);
    } else {
      this.getModuleReheatedAdditionalField(AppDocumentType.CREDIT_NOTE, false);
      this.initAddAccounts();
      this.initAddItems();
      return;
    }
  }

  /**
   * this method can be used to change vendor list functions
   * @param vendorId to vendor id
   */
  changeVendorList(vendorId) {
    this.clearItemDetailTableData();
    this.createCreditNoteForm.get('vendorEmail').reset();
    this.createCreditNoteForm.get('poId').reset();
    if (vendorId === null || vendorId === undefined) {
      this.billPaymentUtility.vendorRelatedPoList = new DropdownDto();
      this.poId = null;
      return;
    } else if (vendorId === AppConstant.ZERO) {
      this.addVendorPanel = true;
      this.createCreditNoteForm.get('vendorId').reset();
    } else {
      this.selectedVendorId = vendorId;
      this.getVendorEmailAddress(vendorId);
      this.addVendorPanel = false;
      this.getVendorItemList(vendorId);
      let poId: number;
      this.poId != null ? poId = this.poId : poId = AppConstant.ZERO;
      this.isEdit ? this.billPaymentUtility.getVendorRelatedPOList(vendorId, poId) :
        this.billPaymentUtility.getVendorRelatedPOList(vendorId, AppConstant.ZERO);
    }
  }

  /**
   * get vendor email address
   * @param vendorId to selected vendor id
   */
  getVendorEmailAddress(vendorId) {
    this.creditNoteService.getVendorEmailAddress(vendorId).then((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.createCreditNoteForm.get('vendorEmail').patchValue(res.body.message);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    const tempLineItemAdditionalData = this.additionalFieldLineItemDetails;
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    this.additionalFieldLineItemDetails = tempLineItemAdditionalData;
    for (let i = AppConstant.ZERO; i < AppConstant.INITIAL_ITEM_DETAIL_COUNT; i++) {
      this.addItemOnclickLink();
    }
    this.getVendorItemList(this.selectedVendorId);
  }

  /**
   * this method trigger according to the po change
   * @param poId to po id
   */
  changePOList(poId) {
    this.itemDetails = [];
    this.lineAccountDetails = [];
    const tempAdditionalDataStructure = this.additionalFieldLineItemDetails;
    const tempAdditionalDataForAccount = this.accountAdditionalFieldDetails;
    this.poId = poId;
    if (!isNotNullOrUndefined(poId)) {
      this.additionalFieldLineItemDetails = [];
      this.accountAdditionalFieldDetails = [];
      this.isVisibleNotificationContent = false;
      while (this.lineItemMainTable.length !== AppConstant.ZERO) {
        this.lineItemMainTable.removeAt(AppConstant.ZERO);
      }
      while (this.accountDetails.length !== AppConstant.ZERO) {
        this.accountDetails.removeAt(AppConstant.ZERO);
      }
      this.initAddItems();
      this.initAddAccounts();
      this.additionalFieldLineItemDetails = tempAdditionalDataStructure;
      this.accountAdditionalFieldDetails = tempAdditionalDataForAccount;
      if (this.additionalFieldLineItemDetails.length > AppConstant.ZERO) {
        this.additionalFieldLineItemDetails.forEach(field => {
          this.lineItemMainTable.controls.forEach((value, index) => {
            this.itemDetailsAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
          });
        });
      }
      if (this.accountAdditionalFieldDetails.length > AppConstant.ZERO) {
        this.accountAdditionalFieldDetails.forEach(field => {
          this.accountDetails.controls.forEach((value, index) => {
            this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
          });
        });
      }
      this.createCreditNoteForm.get('totalCredit').reset();
      this.createCreditNoteForm.get('subTotal').reset();
      return;
    } else {
      if (this.responsePOId === poId && this.isEdit) {
        while (this.lineItemMainTable.length !== AppConstant.ZERO) {
          this.lineItemMainTable.removeAt(AppConstant.ZERO);
        }
        while (this.accountDetails.length !== AppConstant.ZERO) {
          this.accountDetails.removeAt(AppConstant.ZERO);
        }
        this.tempItemDetailListInEdit.forEach(() => {
          this.addItemOnclickLink();
        });
        this.tempAccountDetailListInEdit.forEach(() => {
          this.addAccountFieldOnClick();
        });
        this.isVisibleNotificationContent = this.isClosedPO();
        this.lineItemMainTable.patchValue(this.tempItemDetailListInEdit);
        this.accountDetails.patchValue(this.tempAccountDetailListInEdit);
        return;
      } else {
        this.isVisibleNotificationContent = false;
      }
      this.getPORelatedItemDetails(poId);
      this.isNoDetailsForSelectedPO();
    }
  }

  /**
   * get po item data
   * @param poId to selected po id
   */
  getPORelatedItemDetails(poId): any {
    return new Promise<void>(resolve => {
      this.creditNoteService.getPoLineItemData(poId).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.itemDetails = res?.body.lineItemsDetails;
          this.lineAccountDetails = res?.body.accountDetails;
          if (this.itemDetails.length === AppConstant.ZERO && this.lineAccountDetails.length === AppConstant.ZERO) {
            return;
          } else {
            while (this.lineItemMainTable.length !== AppConstant.ZERO) {
              this.lineItemMainTable.removeAt(AppConstant.ZERO);
            }
            while (this.accountDetails.length !== AppConstant.ZERO) {
              this.accountDetails.removeAt(AppConstant.ZERO);
            }
            if (this.itemDetails.length > AppConstant.ZERO) {
              this.itemDetails.forEach((vl, i) => {
                this.addItemOnclickLink();
                this.itemDetails[i].uomId ? this.itemDetails[i].uomId = this.itemDetails[i].uomId.id : null;
                this.itemDetails[i].qty = this.itemDetails[i].creditRemainingQty;
                const qty: number = (!this.itemDetails[i].qty) ? 0.00 :
                  this.itemDetails[i].qty;
                const lineAmount: number = (!this.itemDetails[i].unitPrice) ? 0.00 :
                  this.itemDetails[i].unitPrice;
                const total: number = parseFloat((qty * lineAmount) + AppConstant.EMPTY_STRING);
                this.itemDetails[i].amount = total;
              });
              await this.lineItemMainTable.patchValue(this.itemDetails);
            }
            if (this.lineAccountDetails.length > AppConstant.ZERO) {
              this.lineAccountDetails.forEach((vl, i) => {
                vl.amount = vl.creditNoteBalance;
                this.addAccountFieldOnClick();
              });
              await this.accountDetails.patchValue(this.lineAccountDetails);
            }
          }
          this.calculateTotal();
          resolve();
        } else {
          resolve();
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });

  }

  /**
   * this method load credit note data
   * @param creditNoteId to credit note master id
   */
  getCreditNoteData(creditNoteId) {
    if (!creditNoteId) {
      return;
    } else {
      this.creditNoteService.getCreditNoteDetail(creditNoteId, this.isDetailView).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          // Format DateStr in to ISO date format
          try {
            res.body.creditNoteDate = DataFormatToISODate.convert(res.body.creditNoteDate);
          } catch (e) {
          }
          this.creditNoteDto = res.body;
          this.selectedVendorId = res.body.vendorId;
          this.creditNoteAttachments = res.body.creditNoteAttachments;
          this.tempItemDetailListInEdit = res.body.creditNoteItemDetails;
          this.tempAccountDetailListInEdit = res.body.creditNoteAccountDetails;
          this.purchaseOrderStatus = res.body.poStatus;
          this.isVisibleNotificationContent = this.purchaseOrderStatus === 'C';
          res.body.additionalFieldAttachments?.forEach(attachment => {
            this.creditNoteAttachments.push(attachment);
          });
          this.getModuleReheatedAdditionalField(AppDocumentType.CREDIT_NOTE, false);
          this.billPaymentUtility.getVendorRelatedPOList(res.body.vendorId, res.body.poId ? res.body.poId : AppConstant.ZERO);
          this.getVendorItemList(res.body.vendorId);
          if (res.body.poId) {
            this.poId = res.body.poId;
            this.responsePOId = res.body.poId;
          } else {
            this.poId = 0;
          }
          if (res.body.creditNoteItemDetails.length > AppConstant.ZERO && !this.poId) {
            res.body.creditNoteItemDetails.forEach((vl, index) => {
              this.addItemOnclickLink();
              vl.vendorItemNumber ? this.lineItemMainTable.controls[index].get('vendorItemNumber').patchValue(vl.vendorItemNumber) :
                this.lineItemMainTable.controls[index].get('vendorItemNumber').patchValue(null);
              this.getItemRelatedSku(res.body.vendorId, vl.productId, index);
            });
          } else if (res.body.creditNoteItemDetails.length > AppConstant.ZERO && this.poId) {
            res.body.creditNoteItemDetails.forEach((vl, index) => {
              this.addItemOnclickLink();
              this.lineItemMainTable.controls[index].get('poDetailId').patchValue(vl.id);
            });
          } else if (!this.poId) {
            this.addItemOnclickLink();
          }

          if (res.body.creditNoteAccountDetails.length > AppConstant.ZERO && !this.poId) {
            res.body.creditNoteAccountDetails.forEach((vl, index) => {
              this.addAccountFieldOnClick();
            });
          } else if (res.body.creditNoteAccountDetails.length > AppConstant.ZERO && this.poId) {
            res.body.creditNoteAccountDetails.forEach((vl, index) => {
              this.addAccountFieldOnClick();
            });
          } else if (!this.poId) {
            this.addAccountFieldOnClick();
          }
          this.createCreditNoteForm.patchValue(res.body);
          this.calculateTotal();
          this.isDraftNameAvailable = false;
          if (this.isClickedEditButtonFromDraftList) {
            this.creditNoteService.isProcessingPatchingDataFromCreditNoteDraft.next({
              isProgress: false,
              index: this.userAvailableDraftList.findIndex(x => x.id === this.draftId)
            });
            this.isShowDraftListPopUp = false;
          }
        } else {
          this.stopDraftClickedAction();
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.stopDraftClickedAction();
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to download credit note attachment
   * @param attachment to attachment
   */
  downloadAttachment(attachment) {
    if (attachment.fieldId) {
      this.downloadAdditionalAttachment(attachment);
    } else {
      this.downloadCreditNoteAttachment(attachment);
    }
  }

  /**
   * this method can be used to delete attachment
   * @param attachment to attachment object
   * @param i to index
   */
  deleteAttachment(attachment, i) {
    if (attachment.fieldId) {
      this.deleteAdditionalAttachment(attachment, i);
    } else {
      this.deleteCreditNoteAttachment(attachment, i);
    }
  }


  /**
   * this method can be used to download credit note attachment
   * @param attachment to attachment
   */
  downloadCreditNoteAttachment(attachment) {
    attachment.loading = true;
    this.creditNoteService.downloadAdditionalAttachment(attachment.id).subscribe((res: any) => {
      this.downloadActionProperty(attachment, res);
    }, error => {
      attachment.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * common download property
   * @param attachment to attachment
   * @param res to response
   */
  downloadActionProperty(attachment, res) {
    console.log('start download:', res);
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', attachment.fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    attachment.loading = false;
  }

  /**
   * this method can be used to delete attachment
   * @param attachment to attachment object
   * @param i to index
   */
  deleteCreditNoteAttachment(attachment, i) {
    this.confirmationService.confirm({
      key: 'creditNote',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.creditNoteService.deleteAdditionalAttachment(attachment.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
            this.creditNoteAttachments.splice(i, 1);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * ---------------------Credit Note Additional field ---------------------------------------------------------->
   */

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createCreditNoteForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl,
                                 multiSelect) {
    if (event.itemValue === 0 || event.value === 0) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
    if (multiSelect._options.length === AppConstant.ONE && additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
    if (multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        value.isChecked = true;
      });
    } else {
      const allChecked: boolean = multiSelect._options.every(function (item: any) {
        return item.isChecked == false;
      });

      if (allChecked) {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = false;
          }
        });
      } else {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = true;
          }
        });
      }
    }
    if (additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE && multiSelect.allChecked) {

      let idArray: number [] = [];
      idArray = additionalField.get(AppConstant.FIELD_VALUE).value;
      idArray.forEach((value, index) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });

      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = false;
        }
      });
    }
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * format date
   */

  formatDateHeadingSection(event, index) {
    this.headingSectionArray.controls[index].get('fieldValue').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemDetailsAdditionalFields(index) {
    return this.lineItemMainTable.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * date change
   * @param event to change event
   * @param index to index
   * @param field to sub form group
   */
  formatDateSection(event, index, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
  }

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {

    this.additionalFieldService.getAdditionalField(id, isDetailView, !this.isEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.additionalFieldResponse = res.body;
        this.dpNameVendor.focus();

        this.additionalFieldResponse.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, isDetailView);

          if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
            this.addHeadingField(field);
          }

          if (field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) {
            this.addLineField(field);
          }

          if (field.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO) {
            this.addLineFieldForAccounts(field);
          }

        }));

        if (this.creditNoteDto && this.isEdit) {
          this.creditNoteDto.additionalData = this.commonUtil.patchDropDownAdditionalData(this.creditNoteDto.additionalData);
          this.creditNoteDto.creditNoteItemDetails = this.commonUtil.patchDropDownAdditionalLineItemData(this.creditNoteDto.creditNoteItemDetails);
          this.creditNoteDto.creditNoteAccountDetails = this.commonUtil.patchDropDownAdditionalLineItemData(this.creditNoteDto.creditNoteAccountDetails);
          this.creditNoteDto.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.creditNoteDto.additionalData);
          this.commonUtil.alignLineAdditionalData(this.creditNoteDto.creditNoteItemDetails, this.additionalFieldLineItemDetails);
          this.commonUtil.alignLineAdditionalData(this.creditNoteDto.creditNoteAccountDetails, this.accountAdditionalFieldDetails);
          this.createCreditNoteForm.patchValue(this.creditNoteDto);
          this.isNoDetailsForSelectedPO();
        }


      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field to additional field object
   */
  public addLineField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.creditNoteDto.creditNoteItemDetails, field, false, !this.isEdit)) {
      return;
    }
    this.additionalFieldLineItemDetails.push(field);
    this.lineItemMainTable.controls.forEach((value, index) => {
      this.itemDetailsAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForAccounts(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.creditNoteDto.creditNoteAccountDetails, field,
      false, !this.editView)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    this.accountDetails.controls.forEach((value, index) => {
      this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * download additional field attachment
   * @param val to additional field object
   */
  downloadAdditionalAttachment(val) {
    val.loading = true;
    this.creditNoteService.downloadAdditionalFieldAttachment(val.id).subscribe((res: any) => {
      this.downloadActionProperty(val, res);
    }, error => {
      val.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method use for delete additional field attachment
   * @param val to additional field object
   * @param index to index number
   */
  deleteAdditionalAttachment(val: any, index: any) {
    this.confirmationService.confirm({
      key: 'creditNote',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.creditNoteService.deleteAdditionalFieldAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
            this.creditNoteAttachments.splice(index, AppConstant.ONE);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * this method use for reset line item table
   */
  resetItemLine() {
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    // changes with draft
    if (this.isEdit && this.tempItemDetailListInEdit.length > AppConstant.ZERO && this.itemDetails.length === AppConstant.ZERO) {
      this.tempItemDetailListInEdit.forEach(() => {
        this.addItemOnclickLink();
      });
      this.lineItemMainTable.patchValue(this.tempItemDetailListInEdit);
      return;
    }
    //

    this.itemDetails.forEach((vl, i) => {
      this.addItemOnclickLink();
      // this.itemDetails[i].uomId ? this.itemDetails[i].uomId = this.itemDetails[i].uomId.id : null;
      this.itemDetails[i].qty = this.itemDetails[i].creditRemainingQty;
      this.calculateAmount(i);
    });
    this.lineItemMainTable.patchValue(this.itemDetails);
    this.calculateTotal();
  }

  /**
   * this method use for reset line account table
   */
  resetAccountLine() {
    while (this.accountDetails.length !== AppConstant.ZERO) {
      this.accountDetails.removeAt(AppConstant.ZERO);
    }

    // changes with draft
    if (this.isEdit && this.tempAccountDetailListInEdit.length > AppConstant.ZERO && this.tempAccountDetailListInEdit.length === AppConstant.ZERO) {
      this.tempAccountDetailListInEdit.forEach(() => {
        this.addAccountFieldOnClick();
      });
      this.accountDetails.patchValue(this.tempAccountDetailListInEdit);
      return;
    }
    //

    this.lineAccountDetails.forEach((vl, i) => {
      this.addAccountFieldOnClick();
    });
    this.accountDetails.patchValue(this.lineAccountDetails);
    this.calculateTotal();
  }

  /**
   * close edit/create mode
   */
  close() {
    this.closeEditView.emit();
    this.emitSuccess.emit();
  }

  /**
   * this method used for get submit action progress status
   */
  isFormSubmitActionProgress() {
    return (this.isSaveAsDraft || this.triggerEditOption || this.isSubmit ||
      ((this.responsePOId === this.poId) && this.isClosedPO()));
  }

  /**
   * this method used for conditionally show hide create receipt button
   */
  isVisibleCreateCreditNoteButton() {
    return (!this.isEdit || (this.isEdit &&
    isNotNullOrUndefined(this.creditNoteStatus) ? this.creditNoteStatus === this.enums.STATUS_DRAFT : false));
  }

  /**
   * this method used for conditionally show hide save as draft button
   */
  isVisibleSaveAsDraftButton() {
    return (!this.creditNoteStatus || (this.isEdit &&
    isNotNullOrUndefined(this.creditNoteStatus) ? this.creditNoteStatus === this.enums.STATUS_DRAFT : false));
  }

  /**
   * this method used for conditionally show hide save button
   */
  isVisibleSaveCreditNoteButton() {
    return this.isEdit &&
    isNotNullOrUndefined(this.creditNoteStatus) ? (this.creditNoteStatus !== this.enums.STATUS_DRAFT) : false;
  }

  /**
   * this method can be used to save po receipt draft
   * @param value to form value
   */
  checkSaveAsDraft(value: any) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE ,
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.isSaveAsDraft = true;
    let invalidForm = !this.createCreditNoteForm.get('creditNoteNo').value ||
      !this.createCreditNoteForm.get('vendorId').value;

    if (invalidForm) {
      if (!this.createCreditNoteForm.get('vendorId').value) {
        this.createCreditNoteForm.get('vendorId').markAsDirty();
      }
      if (!this.createCreditNoteForm.get('creditNoteNo').value) {
        this.createCreditNoteForm.get('creditNoteNo').markAsDirty();
      }
      this.isSaveAsDraft = false;
      return;
    } else {
      this.saveDraft();
    }
  }

  /**
   * This method used for save po receipt as draft
   */
  saveDraft() {
    let creditNoteDto = this.createCreditNoteForm.value;
    creditNoteDto.additionalData = this.commonUtil.formatMultisetValues(creditNoteDto.additionalData);
    creditNoteDto.creditNoteItemDetails = this.commonUtil.formatMultisetLineValues(creditNoteDto.creditNoteItemDetails);
    this.creditNoteService.saveCreditNoteAsDraft(creditNoteDto, this.isEdit, this.isOverrideData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editView ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.resetCreditNoteForm(true);
        this.close();
        this.isSaveAsDraft = false;

      } else {
        this.isSaveAsDraft = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isSaveAsDraft = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Check the Remaining Ceiling with and bill amount
   * Then Returns the boolean to show or hide the warning message
   */
  showMsg(): any {
    if (this.isClosedPO()) {
      return HttpResponseMessage.CLOSED_SELECTED_PO;
    }
  }

  /**
   * return true if empty line table data of selected po
   */
  isNoDetailsForSelectedPO() {
    if (this.responsePOId === this.poId) {
      return this.isVisibleNotificationContent = (this.isClosedPO());
    }
  }

  /**
   * return draft record
   */
  isDraft() {
    return (this.creditNoteStatus === AppEnumConstants.STATUS_DRAFT);
  }

  /**
   * return closed po
   */
  isClosedPO() {
    return (this.purchaseOrderStatus === AppEnumConstants.STATUS_CLOSED);
  }

  /**
   * This method can be used to get available draft id
   */
  getAvailableDraftId() {
    let vendorId = this.createCreditNoteForm.get('vendorId').value;
    let creditNoteNo = this.createCreditNoteForm.get('creditNoteNo').value;
    if (!(isNotNullOrUndefined(creditNoteNo) && isNotNullOrUndefined(vendorId)) || this.isEdit) {
      return;
    } else {
      this.creditNoteService.getAvailableDraftIdByName(vendorId, creditNoteNo).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isDraftNameAvailable = (isNotNullOrUndefined(res.body) && (this.creditNoteStatus !==
            this.enums.STATUS_DRAFT || this.isOverrideData));
          return this.draftId = res.body;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to override values from created draft
   */
  overrideDraftValuesToForm() {
    if (!isNotNullOrUndefined(this.draftId)) {
      this.isOverrideData = false;
      return;
    } else {
      this.confirmationService.confirm({
        message: 'Your changes will not be saved',
        key: 'creditNoteOverrideConfirmation',
        accept: () => {
          this.dtaOverrideFromDraft();
        }
      });
    }
  }

  /**
   * this method get draft related data and patch to the form
   */
  dtaOverrideFromDraft() {
    this.isOverrideData = true;
    this.creditNoteId = this.draftId;
    this.resetCreditNoteForm(true);
  }

  /**
   * this method used for manage condition of view draft list popup
   */
  showAvailableDraftListPopUp() {
    this.billPaymentUtility.getCreditNoteDraftListState();
    setTimeout(() => {
      this.getAvailableDraftList();
    }, 1000);
  }

  /**
   * this method can be used to get user available draft list
   * this function call from onInit() method
   */
  getAvailableDraftList() {
    if (this.isEdit) {
      return;
    }
    this.creditNoteService.getUserAvailableDraftList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.userAvailableDraftList = res.body;
        this.isShowDraftListPopUp = (this.userAvailableDraftList.length > this.appConstant.ZERO
          && this.billPaymentUtility.showBillDraftListByDefault &&
          (this.creditNoteStatus !== this.enums.STATUS_DRAFT));
      } else {
        this.isShowDraftListPopUp = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isShowDraftListPopUp = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can used to stop progress clicked event
   */
  stopDraftClickedAction() {
    this.creditNoteService.isProcessingPatchingDataFromCreditNoteDraft.next({
      isProgress: false,
      index: this.selectedIndexFromDraft,
    });
  }

  /**
   * this method can be used to clear item lines
   */
  clearItemLines() {
    const itemTableLength: number = this.lineItemMainTable.length;
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < itemTableLength; i++) {
      this.addItemOnclickLink();
    }
  }

  /**
   * this method can be used to clear account lines
   */
  clearAccountLines() {
    const accountTableLength: number = this.accountDetails.length;
    while (this.accountDetails.length !== AppConstant.ZERO) {
      this.accountDetails.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < accountTableLength; i++) {
      this.addAccountFieldOnClick();
    }
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  /**
   * This method use for open the UOM create drawer
   * @param $event
   * @param i
   */
  addNewUOMList(event, index) {
    if (event.value === 0) {
      this.addNewUOM = true;
      this.lineItemMainTable.controls[index].get('uomId').reset();
    }
  }
}
