import {Component, Input, OnInit, Output, EventEmitter, HostListener, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {DropdownDto} from "../../../../shared/dto/common/dropDown/dropdown-dto";
import {RemoveSpace} from "../../../../shared/helpers/remove-space";
import {PatternValidator} from "../../../../shared/helpers/pattern-validator";
import {AppPatternValidations} from "../../../../shared/enums/app-pattern-validations";
import {CreditNoteItemDetail} from "../../../../shared/dto/credit-note/credit-note-item-detail";
import {HttpResponseMessage} from "../../../../shared/utility/http-response-message";
import {ConfirmationService} from "primeng/api";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {AppResponseStatus} from "../../../../shared/enums/app-response-status";
import {VendorInvoiceService} from "../../../../shared/services/vendor-community/vendor-invoice.service";
import {CommonUtility} from "../../../../shared/utility/common-utility";
import {DataFormatToISODate} from "../../../../shared/utility/data-format-toISODate";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../../shared/enums/app-authorities";
import {FormGuardService} from "../../../../shared/guards/form-guard.service";
import {AppEnumConstants} from "../../../../shared/enums/app-enum-constants";

@Component({
  selector: 'app-create-credit-note-from-vendor',
  templateUrl: './create-credit-note-from-vendor.component.html',
  styleUrls: ['./create-credit-note-from-vendor.component.scss']
})
export class CreateCreditNoteFromVendorComponent implements OnInit {
  @Input() isCreate = false;
  @Input() isEdit = false;
  @Input() creditNoteId: any;
  @Input() activeId: any;
  @Input() tenantId: any;
  @Output() closeEditView = new EventEmitter();
  @Output() emitSuccess = new EventEmitter();

  public createCreditNoteForm: UntypedFormGroup;
  public creditNoteAttachments: any [] = [];
  public files: File[] = [];
  public customerList: DropdownDto = new DropdownDto();
  public customerRelatedPoList: DropdownDto = new DropdownDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public appAuthorities = AppAuthorities;
  public enum = AppEnumConstants;
  public otherIdMap = new Map();


  public itemIndex: number;
  public poId: number;
  public isSendToCustomer = false;
  public isSaveAndDraft = false;
  public isUpdate = false;
  public creditNoteStatus: string;

  constructor(public formBuilder: UntypedFormBuilder, public confirmationService:
                ConfirmationService, public creditNoteService: CreditNoteService, public notificationService: NotificationService
    , public vendorInvoiceService: VendorInvoiceService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService, public el: ElementRef) {
  }

  ngOnInit(): void {
    this.createCreditNoteForm = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      tenantId: [AppConstant.NULL_VALUE, Validators.required],
      poId: [AppConstant.NULL_VALUE],
      creditNoteNo: [AppConstant.NULL_VALUE, Validators.required],
      creditNoteDate: [AppConstant.NULL_VALUE, Validators.required],
      customerEmail: [AppConstant.NULL_VALUE, [Validators.compose([Validators.maxLength(150),
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      comment: [AppConstant.NULL_VALUE],
      subTotal: [AppConstant.NULL_VALUE],
      taxAmount: [AppConstant.NULL_VALUE],
      creditTotal: [AppConstant.NULL_VALUE],
      attachments: [AppConstant.NULL_VALUE],
      saveAsDraft: [AppConstant.NULL_VALUE],
      creditNoteId: [AppConstant.NULL_VALUE],
      existingTenantId: [AppConstant.NULL_VALUE],
      vendorPoId: [AppConstant.NULL_VALUE],
      creditNoteItemDetails: this.formBuilder.array([]),
    });
    this.getCustomerList();
    if (this.isEdit) {
      this.getCreditNoteData(this.creditNoteId);
    } else {
      this.initAddItems();
    }
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
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.createCreditNoteForm.get('creditNoteItemDetails') as UntypedFormArray;
  }

  /**
   * calculate amount
   * @param index to item detail index number
   */
  calculateAmount(index) {
    this.itemIndex = index;
    const lineAmount: number = (!this.lineItemMainTable.controls[index].value.unitPrice) ? 0.00 :
      this.lineItemMainTable.controls[index].value.unitPrice;

    const qty: number = (!this.lineItemMainTable.controls[index].value.qty) ? 0.00 :
      this.lineItemMainTable.controls[index].value.qty;

    const total: number = parseFloat((qty * lineAmount) + AppConstant.EMPTY_STRING);

    this.lineItemMainTable.controls[index].value.amount = total;

    this.calculateTotal();
  }

  /**
   * This method use for calculate total
   */
  calculateTotal() {
    let totalLineItemAmount = 0.0;
    let totalCreditAmount = 0.0;
    let taxAmount = 0.0;

    const itemDetails: CreditNoteItemDetail[] = this.lineItemMainTable.value;
    itemDetails.forEach((value) => {
      if (value.unitPrice !== undefined && value.qty !== undefined) {
        totalLineItemAmount += value.unitPrice * value.qty;
      }
    });

    taxAmount = this.createCreditNoteForm.get('taxAmount').value;
    totalCreditAmount = totalLineItemAmount + taxAmount;
    this.createCreditNoteForm.get('subTotal').patchValue(totalLineItemAmount);
    this.createCreditNoteForm.get('creditTotal').patchValue(totalCreditAmount);
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
        if ((this.lineItemMainTable.length) - 2 === i) {
          this.addItem();
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
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      itemName: [AppConstant.NULL_VALUE],
      qty: [AppConstant.NULL_VALUE],
      itemNumber: [AppConstant.NULL_VALUE],
      uomId: [AppConstant.NULL_VALUE],
      unitPrice: [AppConstant.NULL_VALUE],
      description: [AppConstant.NULL_VALUE],
      amount: [AppConstant.NULL_VALUE],
      poDetailId: [AppConstant.NULL_VALUE],
    });
    this.lineItemMainTable.push(itemInfo);
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
   * this method can be used for remove line item detail
   * @param i to selected index
   */
  removeItem(i: any) {
    this.lineItemMainTable.removeAt(i);
  }

  /**
   * this method can be used to delete attachment
   * @param attachment to attachment object
   * @param i to index
   */
  deleteCreditNoteAttachment(attachment, i) {
    this.confirmationService.confirm({
      key: 'creditNoteFromVendor',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.creditNoteService.deleteAdditionalAttachmentFromVendor(attachment.id, this.tenantId).subscribe((res: any) => {
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
    this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    attachment.loading = false;
  }

  /**
   * this method can be used for reset credit note form
   */
  resetCreditNoteForm() {
    this.files = [];
    if (!this.isEdit) {
      this.createCreditNoteForm.reset();
      this.clearItemDetailTableData();
    } else {
      this.createCreditNoteForm.reset();
      while (this.lineItemMainTable.length !== AppConstant.ZERO) {
        this.lineItemMainTable.removeAt(AppConstant.ZERO);
      }
      this.getCreditNoteData(this.creditNoteId);
    }
  }

  /**
   * this method can be used to on change customer list
   * @param value to tenant id
   */
  changeCustomerList(value) {
    this.clearItemDetailTableData();
    this.createCreditNoteForm.get('poId').reset();
    this.createCreditNoteForm.get('customerEmail').reset();
    this.customerRelatedPoList = new DropdownDto();
    this.createCreditNoteForm.get('creditTotal').reset();
    this.createCreditNoteForm.get('subTotal').reset();
    this.createCreditNoteForm.get('taxAmount').reset();
    if (!value) {
      return;
    } else {
      this.getCustomerEmailAddress(value);
      this.getCustomerRelatedPOList(value);
    }

  }

  /**
   * this method can be used for get customer list
   */
  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customerList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    this.initAddItems();
  }

  /**
   * get customer email address
   * @param tenantId to selected customer id
   */
  getCustomerEmailAddress(tenantId) {
    this.creditNoteService.getCustomerEmailAddress(tenantId).then((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.createCreditNoteForm.get('customerEmail').patchValue(res.body.message);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get customer related po list
   * @param id to tenant id
   */
  getCustomerRelatedPOList(id) {
    if (!id) {
      return;
    } else {
      this.creditNoteService.getCustomerRelatedPoList(id).subscribe((res: any) => {
        this.customerRelatedPoList.data = res.body;
        this.customerRelatedPoList.data.forEach((value: any) => {
          if (!value.otherId) {
            return;
          } else {
            this.otherIdMap.set(value.id, value.otherId);
          }
        });
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to credit note send to customer
   * @param value to form data
   */
  creditNoteCreateAndSendToCustomer(value) {
    this.isSendToCustomer = true;
    if (this.createCreditNoteForm.invalid) {
      this.isSendToCustomer = false;
      new CommonUtility().validateForm(this.createCreditNoteForm);
    } else {
      this.creditNoteService.sendToCustomer(value, false).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isSendToCustomer = false;
          this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_SEND_TO_CUSTOMER_SUCCESSFULLY);
          this.resetCreditNoteForm();
          this.emitSuccess.emit();
        } else {
          this.isSendToCustomer = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isSendToCustomer = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to credit note send to customer
   * @param value to form data
   */
  saveAndDraft(value) {
    this.isSaveAndDraft = true;
    if (this.createCreditNoteForm.invalid) {
      this.isSaveAndDraft = false;
      new CommonUtility().validateForm(this.createCreditNoteForm);
    } else {
      this.creditNoteService.saveAndDraft(value, true).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isSaveAndDraft = false;
          this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_SAVE_DRAFT_SUCCESSFULLY);
          this.resetCreditNoteForm();
          this.emitSuccess.emit();
        } else {
          this.isSaveAndDraft = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isSaveAndDraft = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method load credit note data
   * @param creditNoteId to credit note master id
   */
  getCreditNoteData(creditNoteId) {
    if (!creditNoteId && !this.tenantId) {
      return;
    } else {
      this.creditNoteService.getCreditNoteDetailForVendor(creditNoteId, false, this.tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          // Format DateStr in to ISO date format
          try {
            res.body.creditNoteDate = DataFormatToISODate.convert(res.body.creditNoteDate);
          } catch (e) {
          }
          this.createCreditNoteForm.get('creditNoteId').patchValue(this.creditNoteId);
          this.createCreditNoteForm.get('tenantId').patchValue(this.tenantId);
          this.getCustomerRelatedPOList(this.tenantId);
          this.getCustomerEmailAddress(this.tenantId);
          this.creditNoteAttachments = res.body.creditNoteAttachments;
          this.creditNoteStatus = res.body.status;
          res.body.additionalFieldAttachments?.forEach(attachment => {
            this.creditNoteAttachments.push(attachment);
          });
          if (res.body.creditNoteItemDetails) {
            for (let i = 0; i < res.body.creditNoteItemDetails.length; i++) {
              this.addItem();
            }
          }
          this.createCreditNoteForm.patchValue(res.body);
          this.createCreditNoteForm.get('existingTenantId').patchValue(this.tenantId);
          this.calculateTotal();
        } else {
          this.notificationService.infoMessage(res.body.message)
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to update credit note
   * @param value to credit note update form data
   */
  updateCreditNote(value) {
    this.isUpdate = true;
    if (this.createCreditNoteForm.invalid) {
      this.isUpdate = false;
      new CommonUtility().validateForm(this.createCreditNoteForm);
    } else {
      if (!this.createCreditNoteForm.get('tenantId').value) {
        return;
      } else {
        this.creditNoteService.updateCreditNoteFromVendorCommunity(value, this.createCreditNoteForm.get('tenantId').value)
          .subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.isUpdate = false;
              this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_UPDATED_SUCCESSFULLY);
              this.emitSuccess.emit();
            } else {
              this.isUpdate = false;
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.isUpdate = false;
            this.notificationService.errorMessage(error);
          });
      }
    }
  }

  /**
   * this method can be used for change po list
   * @param event to change event
   */
  changePoList(event) {
    if (!event.value) {
      return;
    } else {
      this.createCreditNoteForm.get('vendorPoId').patchValue(this.otherIdMap.get(event.value));
    }
  }

  /**
   * this method can be used to close credit note form
   */
  closeCreditNoteForm() {
    this.closeEditView.emit();
  }
}
