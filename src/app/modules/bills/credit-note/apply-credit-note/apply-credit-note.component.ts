import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {RemoveSpace} from '../../../../shared/helpers/remove-space';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AppConstant} from '../../../../shared/utility/app-constant';


@Component({
  selector: 'app-apply-credit-note',
  templateUrl: './apply-credit-note.component.html',
  styleUrls: ['./apply-credit-note.component.scss']
})
export class ApplyCreditNoteComponent implements OnInit {
  public applyToBillForm: UntypedFormGroup;
  public vendorRelatedCreditNoteList: DropdownDto = new DropdownDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public creditNoteMap = new Map();

  public btnLoading = false;
  public isSubmit = false;
  public itemIndex: any;

  @Input() activeAction:any
  @Output() success = new EventEmitter();
  @Input() isFromApprovedBill = false;


  constructor(public formBuilder: UntypedFormBuilder, public creditNoteService: CreditNoteService,
              public notificationService: NotificationService) { }

  ngOnInit(): void {
    this.initFormGroup();

  }

  /**
   * Apply to credit modal related function*------------------------------------------>
   */

  /**
   * this method can be used to initialize form builder
   */
  initFormGroup(){
    this.applyToBillForm = this.formBuilder.group({
      vendorName: [null],
      amountToCredit: [null],
      billNo:[null],
      amountToApply: [null],
      remainingBalance: [null],
      creditBalance: [null],
      totalCredit: [null],
      billId: [null],
      noteDetails: this.formBuilder.array([]),
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
  }

  /**
   * this method can be used to patch data apply to bill form
   */
  onshow(){
    this.resetApplyToBillForm();
    this.applyToBillForm.get('billNo').patchValue(this.activeAction['bill.billNo']);
    this.applyToBillForm.get('remainingBalance').patchValue(this.activeAction['bill.balanceAmount']);

    if(!this.isFromApprovedBill){
      this.applyToBillForm.get('billId').patchValue(this.activeAction['id']);
      this.applyToBillForm.get('vendorName').patchValue(this.activeAction['vendor.id']);
    } else {
      this.applyToBillForm.get('billId').patchValue(this.activeAction['billId']);
      this.applyToBillForm.get('vendorName').patchValue(this.activeAction['vendor.name']);
    }
    this.getVendorRelatedCreditNoteList(this.activeAction['vendorId']);
  }

  /**
   * this method can be used to get vendor related bill list
   * @param id to vendor id
   */
  getVendorRelatedCreditNoteList(id) {
    if (!id) {
      return;
    } else {
      this.creditNoteService.getVendorRelatedCreditNoteList(id).subscribe((res: any) => {
        this.vendorRelatedCreditNoteList.data = res;
        this.vendorRelatedCreditNoteList.data.forEach(creditNote =>{
          this.creditNoteMap.set(creditNote.id, creditNote.remainingBalance);
        });
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to apply credit to bill
   */
  applyCreditNote() {
    this.btnLoading = true;
    this.creditNoteService.applyToCreditNote(this.applyToBillForm.value).subscribe((res:any)=>{
      if(res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS){
        this.notificationService.successMessage(HttpResponseMessage.APPLIED_CREDIT_NOTE_SUCCESSFULLY);
        this.success.emit();
        this.btnLoading = false;
      }else {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.applyToBillForm.get('noteDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      appliedCreditAmount: [null],
      remainingBalance: [null],
      creditBalance: [null],
      creditNoteNo: [null],
      creditNoteId: [null]
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
   * @param creditNoteId id to creditNoteId
   * @param index to index number
   */
  changeCreditNoteList(creditNoteId, index) {
    if(!creditNoteId){
      this.lineItemMainTable.controls[index].get('creditBalance').reset();
      return;
    }else {
      this.lineItemMainTable.controls[index].get('creditBalance').patchValue(this.creditNoteMap.get(creditNoteId));
    }
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
