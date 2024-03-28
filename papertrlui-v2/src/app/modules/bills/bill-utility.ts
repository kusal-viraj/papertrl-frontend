import {BillPaymentService} from '../../shared/services/bill-payment-service/bill-payment.service';
import {AppResponseStatus} from '../../shared/enums/app-response-status';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';
import {BillPaymentMasterDto} from '../../shared/dto/bill-payment/bill-payment-master-dto';
import {CommonMessage} from '../../shared/utility/common-message';
import {AppConstant} from '../../shared/utility/app-constant';
import {NotificationService} from '../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../shared/services/privilege.service';
import {CreditNoteService} from '../../shared/services/credit-note/credit-note.service';
import {BillsService} from '../../shared/services/bills/bills.service';
import {AbstractControl, FormArray, FormGroup, UntypedFormArray, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpResponseMessage} from '../../shared/utility/http-response-message';
import {BillLineLevelPoReceiptDto} from '../../shared/dto/bill/bill-line-level-po-receipt-dto';
import {DomSanitizer} from '@angular/platform-browser';
import {ManageDrawerService} from '../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppFeatureId} from '../../shared/enums/app-feature-id';
import {AppAuthorities} from '../../shared/enums/app-authorities';
import {AppFormConstants} from '../../shared/enums/app-form-constants';
import {AppModuleSection} from "../../shared/enums/app-module-section";

export class BillUtility {

  public billNumber = new DropdownDto();
  public paymentType = new DropdownDto();
  public vendorRelatedBills = new DropdownDto();
  public vendorRelatedPoList: DropdownDto = new DropdownDto();
  public uom: DropdownDto = new DropdownDto();
  public accountTableAccountListArray: DropdownDto [] = [];
  public matchingTableValues: any [] = [];
  public periodMonth: any [] = [];
  public periodYears: any [] = [];
  public ruleDetails: any [] = [];
  public accountListIfSelectHeadingProjectCode: DropdownDto = new DropdownDto();
  public itemPoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [] = [];
  public expensePoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [] = [];
  public uomMap = new Map();
  public poReceiptMap = new Map();

  public isViewMatchingTable = false;
  public isViewThreeWayMatchingTable = false;
  public showBillDraftListByDefault = false;
  public isCheckedPayWhenCustomerPay = false;
  public featureIdEnum = AppFeatureId;



  constructor(public billPaymentService: BillPaymentService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public creditNoteService: CreditNoteService,
              public billsService: BillsService, public sanitizer: DomSanitizer,
              public drawerService: ManageDrawerService) {

    this.getPaymentType(this.paymentType);
    this.getUom(this.uom);
    this.getBillPeriodMonthYear();
  }

  /**
   * this method can be used get vendor related bills
   * @param vendor to vendor id
   * @param billId to bill id
   */
  getVendorRelatedBills(vendor, billId) {
    this.billPaymentService.getVendorRelatedBills(vendor, billId).subscribe((res: any) => {

        this.vendorRelatedBills.data = res;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * This method use for get payment type list for dropdown
   */
  getPaymentType(instance: DropdownDto) {
    this.billPaymentService.getPaymentTypeList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method validate receipt
   * @param event to change event
   * @param billPaymentMasterDto to BillPaymentMasterDto instance
   */
  isValidReceipt(event, billPaymentMasterDto: BillPaymentMasterDto) {
    billPaymentMasterDto.receipt = event.target.files[0];
    if ((billPaymentMasterDto.receipt.size / 1024 / 1024) > AppConstant.MAX_OTHER_SIZE) {
      billPaymentMasterDto.receipt = null;
      this.notificationService.errorMessage(CommonMessage.INVALID_OTHER_SIZE);
      return false;
    }
    return true;
  }

  /**
   * this method can be used to get vendor related po list
   * @param id to vendor id
   * @param poId to po master id
   */
  getVendorRelatedPOList(id, poId) {
    if (!id) {
      return;
    } else {
      this.creditNoteService.getVendorRelatedPoList(id, poId).subscribe((res: any) => {
        this.vendorRelatedPoList.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * get uom list
   * @param listInstance to dropdown instance
   */
  getUom(listInstance: DropdownDto) {
    this.creditNoteService.getUom().subscribe((res: any) => {
      listInstance.data = res.body;
      listInstance.data.forEach(uom => {
        this.uomMap.set(uom.id, uom.name);
      });
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getProjectCodeByPo(id, form: UntypedFormGroup) {
    return new Promise((resolve, reject) => {
      if (form.get(AppFormConstants.PROJECT_CODE_ID).value){
        resolve(true);
        return;
      }
      this.billsService.getProjectCodeByPo(id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          const projectCode = parseInt(res.body.message, 10);
          if (!isNaN(projectCode)) {
            form.get(AppFormConstants.PROJECT_CODE_ID).patchValue(projectCode);
            this.patchProjectTaskToLine(form.get('billExpenseCostDistributions') as FormArray,
              form.get('billItemCostDistributions') as FormArray, projectCode);
            resolve(projectCode);
          } else {
            form.get(AppFormConstants.PROJECT_CODE_ID).reset();
            resolve(null);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
          resolve(null);
        }
      }, (error) => {
        resolve(null);
      });
    });
  }

  getBillPeriodMonthYear() {
    this.billsService.getAccountingPeriodMonthYear().subscribe((res: any) => {
      this.periodYears = res.years;
      this.periodMonth = res.months;
    });
  }

  // 3-way matching related common functions---->

  /**
   * this method can be used to get 3 way matching table data for bill screens
   * @param form to form group
   * @param expenseLineTableFormArray to expense line level form array
   * @param itemLineTableFormArray to item line level form array
   */
  getMatchingTableData(form: UntypedFormGroup, expenseLineTableFormArray: UntypedFormArray, itemLineTableFormArray: UntypedFormArray) {
    this.matchingTableValues = [];
    const matchingObject: any = {};
    matchingObject.poId = form.get('poId').value;
    matchingObject.billId = form.get('id') ? form.get('id').value : null;
    if (form.get('isSelectedBill')) {
      matchingObject.billId = (form.get('isSelectedBill').value === true) ? null : matchingObject.billId;
    }
    matchingObject.vendorId = form.get('vendorId') ? form.get('vendorId').value : null;
    const expenseLineTableForm = JSON.parse(JSON.stringify(expenseLineTableFormArray.value));
    const itemLLineTableForm = JSON.parse(JSON.stringify(itemLineTableFormArray.value));
    matchingObject.billExpenseCostDistributions = expenseLineTableForm;
    matchingObject.billItemCostDistributions = itemLLineTableForm;
    if (matchingObject.billExpenseCostDistributions.length > AppConstant.ZERO) {
      matchingObject.billExpenseCostDistributions.forEach(value => {
        value.additionalData = [];
      });
    }
    if (matchingObject.billItemCostDistributions.length > AppConstant.ZERO) {
      matchingObject.billItemCostDistributions.forEach(value => {
        value.additionalData = [];
      });
    }
    const isSkuSelected: boolean = itemLineTableFormArray.controls.filter(x => x.get('vendorItemNumber').value !== null).length > AppConstant.ZERO;
    const isAccountSelected: boolean = expenseLineTableFormArray.controls.filter(x => x.get('accountId').value !== null).length > AppConstant.ZERO;
    this.isViewMatchingTable = (isSkuSelected || isAccountSelected);
    if (!(matchingObject.poId && this.isViewMatchingTable)) {
      return;
    } else {
      this.billsService.getMatchingTableData(matchingObject).then(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.matchingTableValues = await (res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method can be used for download po receipt attachment
   * @param poReceiptMasterId to po Receipt Master Id
   * @param i to line item index
   * @param isExpenseLineLevel to line level table flag
   */
  viewPoReceiptAttachment(poReceiptMasterId, i: number, isExpenseLineLevel: boolean) {
    if (isExpenseLineLevel) {
      let expensePoReceiptNumber = this.expensePoReceiptLineLevelAttachments[i].poReceiptNumber;
      this.expensePoReceiptLineLevelAttachments[i].receiptId = poReceiptMasterId;
      this.expensePoReceiptLineLevelAttachments[i].isProgressViewReceipt = true;
      this.expensePoReceiptLineLevelAttachments[i].poReceiptNumber ?
        expensePoReceiptNumber = this.expensePoReceiptLineLevelAttachments[i].poReceiptNumber :
        expensePoReceiptNumber = this.poReceiptMap.get(poReceiptMasterId);
      this.expensePoReceiptLineLevelAttachments[i].poReceiptNumber = expensePoReceiptNumber;

    } else {
      let itemPoReceiptNumber = this.itemPoReceiptLineLevelAttachments[i].poReceiptNumber;
      this.itemPoReceiptLineLevelAttachments[i].receiptId = poReceiptMasterId;
      this.itemPoReceiptLineLevelAttachments[i].isProgressViewReceipt = true;
      this.itemPoReceiptLineLevelAttachments[i].poReceiptNumber ?
        itemPoReceiptNumber = this.itemPoReceiptLineLevelAttachments[i].poReceiptNumber :
        itemPoReceiptNumber = this.poReceiptMap.get(poReceiptMasterId);
      this.itemPoReceiptLineLevelAttachments[i].poReceiptNumber = itemPoReceiptNumber;
    }
    if (!poReceiptMasterId) {
      this.itemPoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
      this.expensePoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
      return;
    } else {
      if (isExpenseLineLevel) {
        this.billsService.viewReport(poReceiptMasterId).subscribe((res: any) => {
          if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.expensePoReceiptLineLevelAttachments[i].poReceiptUrl = window.URL.createObjectURL(res.data);
            this.getSafeUrl(this.expensePoReceiptLineLevelAttachments[i].poReceiptUrl, true, i);
            this.expensePoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
          } else {
            this.expensePoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
            this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
          }
        }, error => {
          this.expensePoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
          this.notificationService.errorMessage(error);
        });
      } else {
        this.billsService.viewReport(poReceiptMasterId).subscribe((res: any) => {
          if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.itemPoReceiptLineLevelAttachments[i].poReceiptUrl = window.URL.createObjectURL(res.data);
            this.getSafeUrl(this.itemPoReceiptLineLevelAttachments[i].poReceiptUrl, false, i);
            this.itemPoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
          } else {
            this.itemPoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
            this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
          }
        }, error => {
          this.itemPoReceiptLineLevelAttachments[i].isProgressViewReceipt = false;
          this.notificationService.errorMessage(error);
        });
      }
    }
  }

  /**
   * Security Bypass for PDF Url
   */
  getSafeUrl(url, isLineItemExpense: boolean, i) {
    if (isLineItemExpense) {
      this.expensePoReceiptLineLevelAttachments[i].poReceiptUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
    } else {
      this.itemPoReceiptLineLevelAttachments[i].poReceiptUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
    }
  }

  /**
   * this method can be used to set po receipt name
   * @param receiptId to receipt id
   * @param index to line level index
   * @param isExpense for identify line level
   * @param expenseLineTableFormArray to expense line level form array
   * @param itemLineTableFormArray to item line level form array
   */
  getPoReceiptNumberById(receiptId, index, isExpense, expenseLineTableFormArray: UntypedFormArray, itemLineTableFormArray: UntypedFormArray) {
    if (!receiptId) {
      return;
    } else {
      if (index || index === AppConstant.ZERO) {
        if (isExpense) {
          this.expensePoReceiptLineLevelAttachments[index].poReceiptNumber = this.poReceiptMap.get(receiptId);
        } else {
          this.itemPoReceiptLineLevelAttachments[index].poReceiptNumber = this.poReceiptMap.get(receiptId);
        }
      } else {
        this.headerPORecipeSelectionValueToLineLevel(receiptId, expenseLineTableFormArray, itemLineTableFormArray);
      }
    }
  }

  /**
   * this method patch receipt id to line level po receipt field
   * @param receiptId to receipt id
   * @param expenseLineTableFormArray to expense line level form array
   * @param itemLineTableFormArray to item line level form array
   */
  headerPORecipeSelectionValueToLineLevel(receiptId, expenseLineTableFormArray: UntypedFormArray, itemLineTableFormArray: UntypedFormArray) {
    if (itemLineTableFormArray && itemLineTableFormArray.controls.length > AppConstant.ZERO) {
      itemLineTableFormArray.controls.forEach((formGroup, i) => {
        if (formGroup.dirty || (formGroup.get('rate').value)) {
          itemLineTableFormArray.controls[i].get('poReceiptIdList').patchValue([receiptId]);
          this.itemPoReceiptLineLevelAttachments[i].poReceiptNumber = this.poReceiptMap.get(receiptId);
        }
      });
    }
    if (expenseLineTableFormArray && expenseLineTableFormArray.controls.length > AppConstant.ZERO) {
      expenseLineTableFormArray.controls.forEach((formGroup, i) => {
        if (formGroup.dirty || (formGroup.get('amount').value)) {
          expenseLineTableFormArray.controls[i].get('poReceiptIdList').patchValue([receiptId]);
          this.expensePoReceiptLineLevelAttachments[i].poReceiptNumber = this.poReceiptMap.get(receiptId);
        }
      });
    }
  }

  /**
   * this method validate line level receipt selections
   * @param receiptId to receipt master id in header level
   * @param expenseLineTableFormArray to expense line level form array
   * @param itemLineTableFormArray to item line level form array
   */
  ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(receiptId, expenseLineTableFormArray: UntypedFormArray, itemLineTableFormArray: UntypedFormArray) {
    if (!receiptId) {
      if (itemLineTableFormArray.controls.length > AppConstant.ZERO) {
        itemLineTableFormArray.controls.forEach((formGroup, i) => {
          if (formGroup.dirty || (formGroup.get('rate').value)) {
            itemLineTableFormArray.controls[i].get('poReceiptIdList').patchValue(null);
          }
        });
      }
      if (expenseLineTableFormArray.controls.length > AppConstant.ZERO) {
        expenseLineTableFormArray.controls.forEach((formGroup, i) => {
          if (formGroup.dirty || (formGroup.get('amount').value)) {
            expenseLineTableFormArray.controls[i].get('poReceiptIdList').patchValue(null);
          }
        });
      }
    }
  }


  // Po draft related function

  /**
   * Function used to get user's po draft list
   * Call from create expense constructor()
   */
  getBillDraftListState() {
    this.drawerService.getDefaultDrawerState(AppConstant.BILL_DRAFT_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showBillDraftListByDefault = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  // Po draft related function

  /**
   * Function used to get user's po draft list
   * Call from create expense constructor()
   */
  getCreditNoteDraftListState() {
    this.drawerService.getDefaultDrawerState(AppConstant.CREDIT_NOTE_DRAFT_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showBillDraftListByDefault = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to check selected value length is greater than zero
   * @param value to selected po receipt id list
   */
  isNotEmptyPOReceiptIdList(value) {
    return value && value.length > 0;
  }

  /**
   *Project task related changes----------------------------------------------------------------
   */

  /**
   * this method can be used to set account line table set account list dropdown reference
   */
  addEmptyDropDownReferenceForAccountField() {
    const obj: DropdownDto = new DropdownDto();
    this.accountTableAccountListArray.push(obj);
  }

  /**
   * this method can be used to load accounts according to the project task
   * @param projectCodeId to selected project id
   * @param index to index line index number
   * @param isCreate what is the screen
   * @param billId to bill master id
   */
  loadAccountsAccordingToTheProjectTaskId(projectCodeId, index, isCreate, billId, isFromCreditCard?, isFromBill?) {
    if (!billId && !isFromCreditCard) {
      isCreate = true;
    }
    if (!projectCodeId && projectCodeId !== AppConstant.ZERO) {
      return;
    }
    this.billsService.loadAccountProjectCodeWise(projectCodeId, isCreate, billId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        if (index || index === AppConstant.ZERO) {
          this.accountTableAccountListArray[index].data = [];
          this.accountTableAccountListArray[index].data = res.body;
          if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE) && !isFromCreditCard && isFromBill) {
            this.accountTableAccountListArray[index].addNew();
          }
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used load accounts according to the project code selection
   * @param lneLevelProjectCodeId to line level selected project id
   * @param index to index line index number
   * @param headerLevelProjectCodeId header selected project id
   * @param billId to bill master id
   * @param isFromCreditCard to check from credit card
   */
  async conditionallyLoadAccountList(lneLevelProjectCodeId, index, headerLevelProjectCodeId, billId?, isFromCreditCard?) {
    if (lneLevelProjectCodeId) {
      await this.loadAccountsAccordingToTheProjectTaskId(lneLevelProjectCodeId, index, false, billId, isFromCreditCard);
    } else if (headerLevelProjectCodeId) {
      await this.loadAccountsAccordingToTheProjectTaskId(headerLevelProjectCodeId, index, false, billId, isFromCreditCard);
    } else {
      await this.loadAccountsAccordingToTheProjectTaskId(AppConstant.ZERO, index, false, billId, isFromCreditCard);
    }
  }

  /**
   * this method can be used to reset line account which was loaded according to the header project code selection
   * @param accountLineTableFormArray to account line table array
   */
  async clearAccountWhenClearHeaderProjectTask(accountLineTableFormArray: FormArray) {
    if (!accountLineTableFormArray) {
      return;
    }
    await accountLineTableFormArray.controls.forEach(accountLineTableFormGroup => {
      if (!accountLineTableFormGroup.value.projectId) {
        accountLineTableFormGroup.get('accountId').reset();
        accountLineTableFormGroup.get('accountName').reset();
        accountLineTableFormGroup.get('accountNumber').reset();
      }
    });
  }

  /**
   * this method can be used to reset line account which was loaded according to the header project code selection
   * @param accountLineTableFormGroup to account line formGroup
   */
  clearLineLevelAccountWhenClearProjectTask(accountLineTableFormGroup: FormGroup) {
    if (!accountLineTableFormGroup) {
      return;
    }
    accountLineTableFormGroup.get('accountId').reset();
    accountLineTableFormGroup.get('accountNumber').reset();
    accountLineTableFormGroup.get('accountName').reset();
  }

  /**
   * this method can be used to patch header level project code to line level
   * @param fromGroupLineLevel to line level form group
   * @param fromGroupHeaderLevel to header level form group
   * @param isClear to state of on clear event
   * @param formArray to line level form array
   * @param i to line level index
   */
  patchHeaderProjectCodeToLineLevel(fromGroupLineLevel: FormGroup, fromGroupHeaderLevel: FormGroup, isClear, formArray: FormArray, i) {
    if (!fromGroupLineLevel && !fromGroupHeaderLevel) {
      return;
    }
    const projectCodeLineLevelController = fromGroupLineLevel.get('projectId');
    const projectCodeHeaderHeaderLevelController = fromGroupHeaderLevel.get('projectCodeId');
    if (isClear) {
      projectCodeLineLevelController.reset();
      return;
    }
    if (!formArray.controls[i + 1].get('projectId').value && projectCodeHeaderHeaderLevelController.value && !formArray.controls[i].dirty) {
      formArray.controls[i + 1].get('projectId').patchValue(projectCodeHeaderHeaderLevelController.value);
    } else {
      return;
    }
  }


  animateAccountNumberField(account: FormGroup) {
    setTimeout(() => {
      account.get('hideAccountNumberInput').patchValue(true);
    }, 100);
  }

  /**
   * this method can be used to patch project code to first line
   * @param accounts to account detail array
   * @param items to item detail array
   * @param projectCodeId to header project code id
   */
  patchProjectTaskToLine(accounts?: FormArray, items?: FormArray, projectCodeId?) {
    if (!projectCodeId) {
      return;
    }
    if (items && items.controls.length > 0 && !items.controls[0].get('projectId').value && projectCodeId) {
      items.controls[0].get('projectId').patchValue(projectCodeId);
    }
    if (accounts && accounts.controls.length > 0 && !accounts.controls[0].get('projectId').value && projectCodeId) {
      accounts.controls[0].get('accountId').reset();
      accounts.controls[0].get('accountName').reset();
      accounts.controls[0].get('accountNumber').reset();
      accounts.controls[0].get('projectId').patchValue(projectCodeId);
    }
  }

  /**
   * this method can be used to get status of pay when customer pay
   * @param event to change event
   * @param form to current screen form group
   */
  payWhenCustomerPay(event, form: any) {
    const invoiceId = form.get('customerInvoiceId');
    if (event.checked) {
      invoiceId.setValidators([Validators.required]);
    } else {
      invoiceId.reset();
      invoiceId.clearValidators();
    }
    invoiceId.updateValueAndValidity();
    return (this.isCheckedPayWhenCustomerPay = event.checked);
  }
}
