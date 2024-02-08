import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {DropdownDto} from "../../../../shared/dto/common/dropDown/dropdown-dto";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../../shared/utility/http-response-message";
import {BillsService} from '../../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-apply-credit-note-as-bulk',
  templateUrl: './apply-credit-note-as-bulk.component.html',
  styleUrls: ['./apply-credit-note-as-bulk.component.scss']
})
export class ApplyCreditNoteAsBulkComponent implements OnInit {

  @Input() activeAction: any
  @Input() warningForIgnoredBill: any
  @Output() success = new EventEmitter();
  @Output() selectedBillLengthZero = new EventEmitter();
  @Input() selectedBillList: any [];
  applyCreditNoteBulkForm: UntypedFormGroup;

  public filterList: any [] = [];
  public remainingCreditMap = new Map();
  public totalCreditMap = new Map();
  public vendorList: DropdownDto = new DropdownDto();
  public vendorRelatedCreditNoteList: DropdownDto [] = [];


  public btnLoading = false;


  constructor(public formBuilder: UntypedFormBuilder, public creditNoteService: CreditNoteService,
              public notificationService: NotificationService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.applyCreditNoteBulkForm = this.formBuilder.group({
      applyCreditNoteDetails: this.formBuilder.array([]),
    });
    this.initItem();
    this.getVendorList();
  }

  /**
   * this method can be used to init add items
   */
  initItem() {
    if(!this.selectedBillList){
      return;
    }else {
      for (let i = AppConstant.ZERO; i < this.selectedBillList.length; i++) {
          this.selectedBillList[i]['billNumber'] = this.selectedBillList[i]['bill.billNo'];
          this.selectedBillList[i]['billId'] = this.selectedBillList[i]['id'];
          this.selectedBillList[i]['remainingBillBalance'] = this.selectedBillList[i]['bill.balanceAmount'];
          this.selectedBillList[i]['vendorName'] = this.selectedBillList[i]['vendor.id'];
          this.getVendorRelatedCreditNoteList(this.selectedBillList[i]['vendorId'], i);
          this.addItem();
      }
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.applyCreditNoteBulkForm.get('applyCreditNoteDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      vendorId: [null],
      vendorName: [null],
      billId: [null],
      billNumber: [null],
      remainingBillBalance: [null],
      creditNoteId: [null],
      totalCredit: [null],
      remainingCredit: [null],
      appliedCreditAmount: [null]
    });
    const obj: DropdownDto = new DropdownDto();
    this.vendorRelatedCreditNoteList.push(obj);
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * this method can be used to get vendor related bill list
   * @param id to vendor id
   * @param i to index
   */
  getVendorRelatedCreditNoteList(id, i) {
    if (!id) {
      return;
    } else {
      this.creditNoteService.getVendorRelatedCreditNoteList(id).subscribe((res: any) => {
        this.vendorRelatedCreditNoteList[i].data = res;
        this.vendorRelatedCreditNoteList[i].data.forEach(creditNote => {
          this.remainingCreditMap.set(creditNote.id, creditNote.remainingBalance);
          this.totalCreditMap.set(creditNote.id, creditNote.total);
        });
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * this method can be used to apply credit to bill
   */
  applyCreditNoteBulk() {
    this.btnLoading = true;
    this.creditNoteService.applyToCreditNoteBulk(this.lineItemMainTable.value).subscribe((res:any)=>{
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
   * this method can be used for get vendor list
   */
  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.vendorList.data = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

    this.onShowApplyCreditModal();
  }

  /**
   * this method can be used for view selected data in modal
   */
  onShowApplyCreditModal() {
    if (!this.selectedBillList) {
      return;
    } else {
      this.lineItemMainTable.patchValue(this.selectedBillList);
    }
  }

  /**
   * this method can be used remove bill record from list
   * @param i to index
   */
  removeBill(i: any) {
    this.vendorRelatedCreditNoteList.splice(i, AppConstant.ONE);
    this.lineItemMainTable.removeAt(i);
    if(this.lineItemMainTable.controls.length === AppConstant.ZERO){
      this.selectedBillLengthZero.emit();
    }
  }

  /**
   * get remaining credit
   * @param formGroup to selected formGroup
   */
  getRemainingCredit(formGroup) {
    formGroup.get('remainingCredit').reset();
    formGroup.get('totalCredit').reset();
    if(!formGroup.get('creditNoteId').value){
      return;
    }else {
      formGroup.get('totalCredit').patchValue(this.totalCreditMap.get(formGroup.get('creditNoteId').value));
     formGroup.get('remainingCredit').patchValue(this.remainingCreditMap.get(formGroup.get('creditNoteId').value));
    }
  }
}
