import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {DropdownDto} from "../../../../shared/dto/common/dropDown/dropdown-dto";
import {RemoveSpace} from "../../../../shared/helpers/remove-space";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../../shared/utility/http-response-message";

@Component({
  selector: 'app-apply-to-bill',
  templateUrl: './apply-to-bill.component.html',
  styleUrls: ['./apply-to-bill.component.scss']
})
export class ApplyToBillComponent implements OnInit {

  public applyToBillForm: UntypedFormGroup;
  public vendorRelatedBillList: DropdownDto = new DropdownDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();

  public isSubmit = false;
  public itemIndex: any;

  @Input() activeAction: any
  @Output() success = new EventEmitter();


  constructor(public formBuilder: UntypedFormBuilder, public creditNoteService: CreditNoteService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.initFormGroup();

  }

  /**
   * Apply to credit modal related function*------------------------------------------>
   */

  /**
   * this method can be used to initialize form builder
   */
  initFormGroup() {
    this.applyToBillForm = this.formBuilder.group({
      creditNoteId: [null],
      vendorName: [null],
      amountToCredit: [null],
      billNumber: [null],
      amountToApply: [null],
      creditNoteNo: [null],
      remainingBalance: [null],
      totalCredit: [null],
      creditNoteBillDetails: this.formBuilder.array([]),
    });
    this.onshow();
    this.initItem();
  }

  /**
   * this method can be used to init add items
   */
  initItem() {
    for (let i = 0; i < 5; i++) {
      this.addItem();
    }
  }


  /**
   * this method can be used to reset apply to bill form
   */
  resetApplyToBillForm() {
    this.applyToBillForm.reset();
    this.patchValue();
  }

  /**
   * this method can be used to patch data apply to bill form
   */
  onshow() {
    this.resetApplyToBillForm();
  }

  /**
   * this method can be used to patch value to form
   */
  patchValue(){
    if(!this.activeAction){
      return;
    }else {
      this.applyToBillForm.get('creditNoteId').patchValue(this.activeAction['id']);
      this.applyToBillForm.get('vendorName').patchValue(this.activeAction['creditNote.vendorId']);
      this.applyToBillForm.get('amountToCredit').patchValue(this.activeAction['creditNote.creditBalance']);
      this.applyToBillForm.get('creditNoteNo').patchValue(this.activeAction['creditNote.creditNoteNo']);
      this.getVendorRelatedBillList(this.activeAction['vendorId']);
    }
  }

  /**
   * this method can be used to get vendor related bill list
   * @param id to vendor id
   */
  getVendorRelatedBillList(id) {
    if (!id) {
      return;
    } else {
      this.creditNoteService.getVendorRelatedBillList(id).subscribe((res: any) => {
        this.vendorRelatedBillList.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to apply credit to bill
   */
  applyToBill() {
    this.isSubmit = true;
    this.creditNoteService.applyToCredit(this.applyToBillForm.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_AMOUNT_APPLIED_TO_BILL_SUCCESSFULLY);
        this.success.emit();
        this.isSubmit = false;
      } else {
        this.isSubmit = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isSubmit = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor related bill list
   * @param id to vendor id
   * @param index to index
   */
  getRemainingBalance(id, index) {
    if (!id) {
      this.lineItemMainTable.controls[index].get('remainingBalance').reset();
      return;
    } else {
      this.creditNoteService.getRemainingBalance(id).subscribe((res: any) => {
        this.lineItemMainTable.controls[index].get('remainingBalance').patchValue(res.message);
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.applyToBillForm.get('creditNoteBillDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      billId: [null],
      appliedCreditAmount: [null],
      remainingBalance: [null]
    });
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    const len = (this.lineItemMainTable.length) - 1;
    if (len === index) {
      this.addItem();
    }
  }


  /**
   * this method can be used to remove item
   * @param i to index
   */
  removeItem(i) {
    this.lineItemMainTable.removeAt(i);
  }

  /**
   * this method trigger when change the bill list
   * @param billId to bill id
   * @param index to index number
   */
  changeBillList(billId, index) {
    this.getRemainingBalance(billId, index);
  }

  /**
   * calculate amount
   * @param index to item detail index number
   */
  calculateAmount(index) {
    this.itemIndex = index;
    let applyCreditAmount = 0.0;
    this.lineItemMainTable.value.forEach((value) => {
      if (value.appliedCreditAmount) {
        applyCreditAmount += value.appliedCreditAmount;
      }
    });
    this.applyToBillForm.get('totalCredit').patchValue(applyCreditAmount)
  }
}
