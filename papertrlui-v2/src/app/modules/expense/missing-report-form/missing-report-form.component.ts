import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppAuthorities} from "../../../shared/enums/app-authorities";

@Component({
  selector: 'app-missing-report-form',
  templateUrl: './missing-report-form.component.html',
  styleUrls: ['./missing-report-form.component.scss']
})
export class MissingReportFormComponent implements OnInit {


  @Input() selectedMissingReceiptId;
  @Input() transactionId;
  @Input() viewOnly = false;
  @Output() formFilled = new EventEmitter(); // Emits the selected receipt id for transaction
  @Output() attachReceipt = new EventEmitter();
  public formGroup: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public commonUtil = new CommonUtility();
  public isLoading = false;
  public itemList: DropdownDto = new DropdownDto();
  public addNewItemOverlay = false;
  public appAuthorities = AppAuthorities;

  constructor(public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public expenseService: ExpenseService, public formBuilder: UntypedFormBuilder,
              public automationService: AutomationService, private billApprovalsService: BillApprovalsService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      reason: [{value: null, disabled: this.viewOnly}, Validators.required],
      transactionDateStr: [null],
      transactionId: [null],
      cardHolderName: [null],
      id: [null],
      itemList: this.formBuilder.array([]),
      totalAmount: [null]
    });
    this.getFormData();
    this.getItems()
    if (!this.viewOnly){
      this.addItemOnClick();
    }
    this.getTransactionDetail();
  }

  getItems() {
    this.automationService.getItemList().subscribe((res: any) => {
      this.itemList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  get f() {
    return this.formGroup.controls;
  }

  private getFormData() {
    if (!this.selectedMissingReceiptId) {
      return;
    }
    this.expenseService.getMissingReceiptData(this.selectedMissingReceiptId).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        res.body.itemList.forEach(() => {
          this.addItemOnClick();
        })
        this.formGroup.patchValue(res.body);
        this.transactionId = res.body.transactionId;
        this.getTransactionDetail();
        res.body.itemList.forEach((val, i) => {
          this.getItemName(val.itemId, i);
        })
        this.getTotalCostDistribution();
      } else {
        this.notificationService.infoMessage(res.body.message)
      }
    }, error => {
      this.notificationService.errorMessage(error)
    });
  }

  resetForm() {
    this.formGroup.reset();
    this.getFormData();
    this.getTransactionDetail();
  }

  submitForm() {
    if (!this.formGroup.valid) {
      this.isLoading = false;
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.isLoading = true;
    this.formGroup.get('transactionId').patchValue(this.transactionId);
    this.expenseService.saveMissingReceipt(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_MISSING_RECEIPT_UPDATED_SUCCESSFULLY)
        this.formFilled.emit(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message)
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error)
    });
  }


  public get itemListForm() {
    return this.formGroup.get('itemList') as UntypedFormArray;
  }

  /**
   * This method can be used to get item name
   * @param id to selected item id
   *  @param index to formGroup index
   */
  getItemName(id, index) {
    this.itemListForm.controls[index].get('itemNumber').reset();
    if (!this.itemListForm.controls[index].get('itemId').value) {
      return;
    }
    this.billApprovalsService.getItemName(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.itemListForm.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get add new modal
   * @param selectedId to id
   * @param i to index
   */
  changeItemList(selectedId, i) {
    if (selectedId === 0) {
      this.itemListForm.controls[i].get('itemId').reset();
      this.addNewItemOverlay = true;
    }
  }

  getTotalCostDistribution() {
    let totalAmount = 0.00;
    this.itemListForm.controls.forEach((itemCost, index) => {
      const qty = itemCost.value.qty ? itemCost.value.qty : AppConstant.ZERO;
      const rate = itemCost.value.rate ? itemCost.value.rate : AppConstant.ZERO;
      let sum = qty * rate;
      sum = this.commonUtil.roundNum(sum)
      totalAmount += sum;
      if (qty === AppConstant.ZERO && rate === AppConstant.ZERO) {
        sum = null;
      }
      this.itemListForm.controls[index].get('amount').patchValue(sum);
    });
    this.formGroup.get('totalAmount').patchValue(totalAmount);
  }

  removeItem(i: any) {
    this.itemListForm.removeAt(i);
  }

  /**
   * This method add item to array
   */
  addItemOnClick() {
    const itemForm = this.formBuilder.group({
      itemId: [{value: null, disabled: this.viewOnly}],
      qty: [{value: null, disabled: this.viewOnly}],
      rate: [{value: null, disabled: this.viewOnly}],
      amount: [{value: null, disabled: this.viewOnly}],
      itemNumber: [{value: null, disabled: this.viewOnly}],
    });
    this.itemListForm.push(itemForm);
  }

  onLItemClick(i: any) {
    if (this.viewOnly){
      return;
    }
    const len = (this.itemListForm.length) - 1;
    if (len === i) {
      this.addItemOnClick();
    }
  }

  private getTransactionDetail() {
    if (!this.transactionId) {
      return;
    }
    this.expenseService.getTransactionListToIds([this.transactionId]).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.formGroup.get('transactionId').patchValue(res.body[0].id);
        this.formGroup.get('cardHolderName').patchValue(res.body[0].cardHolderName);
        this.formGroup.get('transactionDateStr').patchValue(res.body[0].transactionDateStr);
      }
    }, error => {

    })
  }
}
