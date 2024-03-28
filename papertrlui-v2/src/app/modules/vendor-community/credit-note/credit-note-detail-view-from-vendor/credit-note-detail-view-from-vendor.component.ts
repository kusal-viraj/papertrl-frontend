import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {CommonUtility} from "../../../../shared/utility/common-utility";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../../shared/utility/http-response-message";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";

@Component({
  selector: 'app-credit-note-detail-view-from-vendor',
  templateUrl: './credit-note-detail-view-from-vendor.component.html',
  styleUrls: ['./credit-note-detail-view-from-vendor.component.scss']
})
export class CreditNoteDetailViewFromVendorComponent implements OnInit {

  @Input() creditNoteId: any;
  @Input() tenantId: any;
  @Output() closeEditView = new EventEmitter();
  @Input() activeRecord: any;

  creditNoteDetailForm: UntypedFormGroup;
  public commonUtil = new CommonUtility();
  public creditNoteAttachments: any [] = [];


  constructor(public formBuilder: UntypedFormBuilder, public creditNoteService: CreditNoteService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.creditNoteDetailForm = this.formBuilder.group({
      tenantId: [AppConstant.NULL_VALUE],
      poNumber: [AppConstant.NULL_VALUE],
      creditNoteNo: [AppConstant.NULL_VALUE],
      creditNoteDate: [AppConstant.NULL_VALUE],
      creditNoteDateStr: [AppConstant.NULL_VALUE],
      customerEmail: [AppConstant.NULL_VALUE],
      comment: [AppConstant.NULL_VALUE],
      subTotal: [AppConstant.NULL_VALUE],
      taxAmount: [AppConstant.NULL_VALUE],
      totalCredit: [AppConstant.NULL_VALUE],
      attachments: [AppConstant.NULL_VALUE],
      customerName: [AppConstant.NULL_VALUE],
      creditBalance: [AppConstant.NULL_VALUE],
      creditTotal: [AppConstant.NULL_VALUE],
      creditNoteItemDetails: this.formBuilder.array([]),
    });
    this.getCreditNoteData(this.creditNoteId);
  }

  /**
   * this method can be used to add line item on click
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      qty: [AppConstant.NULL_VALUE],
      itemNumber: [AppConstant.NULL_VALUE],
      unitPrice: [AppConstant.NULL_VALUE],
      description: [AppConstant.NULL_VALUE],
      amount: [AppConstant.NULL_VALUE],
      poDetailId: [AppConstant.NULL_VALUE],
    });
    this.lineItemMainTable.push(itemInfo);
  }


  /**
   * this method return credit note form controllers
   */
  get f() {
    return this.creditNoteDetailForm.controls;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.creditNoteDetailForm.get('creditNoteItemDetails') as UntypedFormArray;
  }

  /**
   * this method can be used to download credit note attachment
   * @param attachment to attachment
   */
  downloadCreditNoteAttachment(attachment) {
    attachment.loading = true;
    this.creditNoteService.downloadAdditionalAttachmentFromVendor(attachment.id, this.tenantId).subscribe((res: any) => {
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
    attachment.loading = false;
    this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    attachment.isLoading = false;
  }

  /**
   * this method can be used to get credit note id
   * @param creditNoteId to credit note id
   */
  getCreditNoteData(creditNoteId) {
    if (!creditNoteId) {
      return;
    } else {
      this.creditNoteService.getCreditNoteDetailForVendor(creditNoteId, false, this.tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.creditNoteItemDetails) {
            for (let i = AppConstant.ZERO; i < res.body.creditNoteItemDetails.length; i++) {
              this.addItem();
            }
          }
          this.creditNoteAttachments = res.body.creditNoteAttachments;
          res.body.additionalFieldAttachments?.forEach(attachment => {
            this.creditNoteAttachments.push(attachment);
          });
          this.creditNoteDetailForm.get('customerName').patchValue(this.activeRecord['creditNote.tenantId']);
          this.creditNoteDetailForm.get('customerEmail').patchValue(this.activeRecord['creditNote.customerEmail']);
          this.creditNoteDetailForm.patchValue(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }
}
