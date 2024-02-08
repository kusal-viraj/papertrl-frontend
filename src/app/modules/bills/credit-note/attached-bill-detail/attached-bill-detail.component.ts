import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-attached-bill-detail',
  templateUrl: './attached-bill-detail.component.html',
  styleUrls: ['./attached-bill-detail.component.scss']
})
export class AttachedBillDetailComponent implements OnInit {

  public attachedBillDetailForm: UntypedFormGroup;

  @Input() activeAction: any;
  @Input() isFromVendor = false;
  @Output() removesAndBillListLengthZero = new EventEmitter();
  @Output() successfullyRemoved = new EventEmitter();

  public billDetails: any [] = [];

  constructor(public formBuilder: UntypedFormBuilder, public creditNoteService: CreditNoteService,
              public notificationService: NotificationService, public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.initFormGroup();
  }

  /**
   * view attached bill modal related function*------------------------------------------>
   */

  /**
   * this method can be used to initialize form builder
   */
  initFormGroup() {
    this.attachedBillDetailForm = this.formBuilder.group({
      id: [null],
      vendorName: [null],
      tenantId: [null],
      amountToCredit: [null],
      creditNoteNo: [null],
      creditTotal: [null],
      appliedTotal: [null],
      creditNoteBillDetails: this.formBuilder.array([]),
    });
    this.onshow();
    if (!this.isFromVendor) {
      this.getBillDetail();
    } else {
      this.getBillDetailsForVendor();
    }
  }

  /**
   * this method return credit note form controllers
   */
  get f() {
    return this.attachedBillDetailForm.controls;
  }


  /**
   * this method can be used to reset attached bill form
   */
  resetApplyToBillForm() {
    this.attachedBillDetailForm.reset();
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
  patchValue() {
    if (!this.activeAction) {
      return;
    } else {
      this.attachedBillDetailForm.get('id').patchValue(this.activeAction.id);
      if (this.isFromVendor) {
        this.attachedBillDetailForm.get('tenantId').patchValue(this.activeAction.tenantId);
      } else {
        this.attachedBillDetailForm.get('vendorName').patchValue(this.activeAction['creditNote.vendorId']);
      }
      this.attachedBillDetailForm.get('amountToCredit').patchValue(this.activeAction['creditNote.creditBalance']);
      this.attachedBillDetailForm.get('creditNoteNo').patchValue(this.activeAction['creditNote.creditNoteNo']);
      this.attachedBillDetailForm.get('creditTotal').patchValue(this.activeAction['creditNote.creditTotal']);
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.attachedBillDetailForm.get('creditNoteBillDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      billId: [null],
      billNo: [null],
      appliedCreditAmount: [null],
      billRemainingBalance: [null]
    });
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * this method can be used to remove item
   * @param i to index
   * @param formGroup to clicked form group object
   */
  removeBill(i, formGroup) {
    this.confirmationService.confirm({
      key: 'attBill',
      message: 'You want to remove the bill',
      accept: () => {
        const billRelationId = formGroup.get('id').value;
        if (!billRelationId) {
          return;
        } else {
          this.creditNoteService.removeAttachedBill(billRelationId).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.BILL_REMOVE_SUCCESSFULLY);
              this.lineItemMainTable.removeAt(i);
              this.calculateTotal();
              this.lineItemMainTable.controls.length === AppConstant.ZERO ? this.removesAndBillListLengthZero.emit() :
                this.successfullyRemoved.emit();
              this.creditNoteService.updatedCreditBalance.subscribe(creditBalance => {
                if (creditBalance) {
                  this.attachedBillDetailForm.get('amountToCredit').patchValue(creditBalance);
                }
              });
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
  }

  /**
   * this method can be used for get bill details
   */
  getBillDetail() {
    const creditNoteMasterId = this.attachedBillDetailForm.get('id').value;
    if (!creditNoteMasterId) {
      return;
    } else {
      this.creditNoteService.getAttachedBillDetail(creditNoteMasterId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.billDetails = [];
          this.billDetails = res.body;

          if (this.billDetails.length < AppConstant.ZERO) {
            return;
          } else {
            for (let i = AppConstant.ZERO; i < this.billDetails.length; i++) {
              this.addItem();
            }
            this.lineItemMainTable.patchValue(this.billDetails);
            this.calculateTotal();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }

  }

  /**
   * this method can be used for get bill details for vendor
   */

  getBillDetailsForVendor() {
    const creditNoteId = this.activeAction.creditNoteId;
    const tenantId = this.activeAction.tenantId;
    if (!creditNoteId && !tenantId) {
      return;
    } else {
      this.creditNoteService.getAttachedBillDetailForVendor(this.activeAction.creditNoteId,
        this.activeAction.tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.billDetails = [];
          this.billDetails = res.body;

          if (this.billDetails.length < AppConstant.ZERO) {
            return;
          } else {
            for (let i = AppConstant.ZERO; i < this.billDetails.length; i++) {
              this.addItem();
            }
            this.lineItemMainTable.patchValue(this.billDetails);
            this.calculateTotal();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for calculate total
   */
  calculateTotal() {
    let totalAmount = 0.0;

    const itemDetails: any [] = this.lineItemMainTable.value;
    itemDetails.forEach((value) => {
      if (value.appliedCreditAmount !== undefined) {
        totalAmount += value.appliedCreditAmount;
      }
    });
    this.attachedBillDetailForm.get('appliedTotal').patchValue(totalAmount);
  }
}
