import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {DataFormat} from '../../../shared/utility/data-format';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {PurchaseOrdersService} from "../../../shared/services/vendor-community/purchase-orders.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {RemoveSpace} from "../../../shared/helpers/remove-space";


@Component({
  selector: 'app-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.scss']
})
export class InvoiceCreateComponent implements OnInit {
  @Output() isClickCloseButton = new EventEmitter<boolean>();
  @Input() tenantIdFrom;
  @Input() poIdFromPo;
  @Input() isFromPo;
  @Input() isFromRecurringTemplate;
  @Input() recurringTemplateId;
  public poId;

  public billMasterDto: BillMasterDto = new BillMasterDto();
  public createEInvoiceForm: UntypedFormGroup;
  public customerList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public uomList: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public dueDate: any;

  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public addNewDropDown = false;
  public appConstant: AppConstant = new AppConstant();
  public appFieldType = AppFieldType;
  public isAvailableValueApprovalUser = false;
  public isAvailableValueApprovalGroup = false;

  public editView = false;
  public attachments: File[] = [];

  public selectedId: any;
  public dateFormat = new DataFormat();
  public isLoading = false;
  public isValidDiscountDate = false;
  public matchingAutomation: any;
  public isWorkflowConfigAvailable = false;

  public isLoadingSaveAsApproved = false;
  public appAuthorities = AppAuthorities;
  public commonUtil = new CommonUtility();
  public previousCustomerIdBeforeChange: any;
  public existingAttachments: any[] = [];
  public appFormConstants = AppFormConstants;

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService, public changeRef: ChangeDetectorRef,
              public vendorInvoiceService: VendorInvoiceService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService,
              public purchaseOrdersService: PurchaseOrdersService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.createEInvoiceForm = this.formBuilder.group({
      tenantId: [AppConstant.NULL_VALUE, Validators.required],
      poId: [AppConstant.NULL_VALUE],
      billNo: [AppConstant.NULL_VALUE, Validators.required],
      billDate: [new Date(), Validators.required],
      term: [AppConstant.NULL_VALUE, Validators.required],
      poNumber: [null],
      termName: [null],
      dueDate: [null],
      remainingCeling: [null],
      netDaysDue: [null],
      discountPercentage: [null],
      discountDaysDue: [null],
      frequencyEvery: [AppConstant.NULL_VALUE],
      unit: [],
      endDate: [],
      receiptId: [],
      event: [],
      billAmount: [0, Validators.min(0.001)],
      tax: [],
      grossAmount: [null],
      vendorScheduleTemplateId: [null],
      additionalNotes: [],
      billItemDetails: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      distributionCostTotal: [null]
    });
    this.createEInvoiceForm.get(AppFormConstants.BILL_NO).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.RECEIPT_ID).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).valueChanges.subscribe(data => this.valueChanged(data));
    this.createEInvoiceForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.valueChanged(data));

    this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(() => this.getCustomerRelatedData());

    this.createEInvoiceForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(() => this.getRemainingCeiling());

    this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).valueChanges.subscribe((data) => this.getDueDate(data, false, false, false));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe((data) => this.getDueDate(data, true, false, false));
    this.createEInvoiceForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.poAndTermChanged(data, 'PO'));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.poAndTermChanged(data, 'TERM'));
    this.getData();
  }

  /**
   * Triggers when a form value change for automation
   */
  valueChanged(data) {
    // if (data && this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value) {
    //   setTimeout(() => {
    //     this.createEInvoiceForm.get(AppFormConstants.EVENT).patchValue(AppDocuments.DOCUMENT_EVENT_SUBMITTED);
    //     const eBillForm = JSON.parse(JSON.stringify(this.createEInvoiceForm.value));
    //     eBillForm.additionalData = [];
    //     eBillForm.createDetails = [];
    //     this.vendorInvoiceService.valuesChanged(eBillForm, this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
    //       if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
    //         if (res.body) {
    //           this.matchingAutomation = res.body.automationWorkflowConfigs;
    //           this.isWorkflowConfigAvailable = res.body.workflowConfigAvailable;
    //         } else {
    //           this.matchingAutomation = null;
    //           this.isWorkflowConfigAvailable = false;
    //         }
    //       }
    //     });
    //   }, 100);
    // }
  }

  async getData() {
    this.initAddItems();
    this.initApprove();
    this.getCustomerList();
    if (this.isFromPo) {
      await this.getPoData();
    }
    if (this.isFromRecurringTemplate) {
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(this.tenantIdFrom);
    }
  }

  getPoData() {
    return new Promise<void>(resolve => {
      this.purchaseOrdersService.getPoData(this.poIdFromPo).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(this.tenantIdFrom);
          this.poId = res.body.id;

          // PurchaseOrder Detail load section
          res.body.purchaseOrderDetails.forEach((value, index) => {
            this.createEInvoiceForm.get(AppFormConstants.PO_ID).patchValue(res.body.id);
            if (value.itemName === 'N/A') {
              value.itemName = null;
            }
            if (value.uomId) {
              value.uomId = value.uomId.id;
            }
            if (value.discountAmount) {
              value.unitPrice = Math.round((value.unitPrice - (value.discountAmount / value.qty)) * 100) / 100;
              value.discountAmount = 0;
            }

            this.addItem();
          });
          this.createEInvoiceForm.get('billItemDetails').patchValue(res.body.purchaseOrderDetails);
          this.calculateTotal();
          resolve();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      }));
    })
  }

  getRecurringInvoiceData() {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getRecurringBillTemplateData(this.recurringTemplateId).subscribe(async (res) => {
        this.existingAttachments = res.body.existingRecurringInvoiceAttachments
        res.body.vendorRecurringAdditionalFieldAttachments?.forEach((value, index) => {
          this.existingAttachments.push(value);
        });

        this.billMasterDto.additionalData = res.body.vendorRecurringAdditionalData;
        this.billMasterDto.billItemDetails = res.body.recurringInvoiceItemDetails;
        await this.vendorInvoiceService.getAutoGeneratedInvoiceNumber(this.recurringTemplateId).then((result: any) => {
          this.createEInvoiceForm.get(AppFormConstants.BILL_NO).patchValue(result.body.billNoPattern)
        }).catch((e) => this.notificationService.errorMessage(e));

        res.body.billItemDetails?.forEach((value, index) => {
          if (value.uomId) {
            value.uomId = value.uomId.id;
          }
          this.addItem();
        });

        // res.body.vendorRecurringTemplateAdHocWorkflowDetailConfigList?.forEach((value, index) => {
        //   this.addAdHocWorkflowDetail();
        // });

        res.body.additionalData = this.commonUtil.patchDropDownAdditionalData(res.body.vendorRecurringAdditionalData);
        res.body.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, res.body.vendorRecurringAdditionalData);


        this.createEInvoiceForm.get(AppFormConstants.VENDOR_SCHEDULE_TEMPLATE_ID).patchValue(res.body.id);
        this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body.term);
        this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
        this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_PERCENTAGE).patchValue(res.body.discountPercentage);
        this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).patchValue(res.body.discountDaysDue);
        this.createEInvoiceForm.get(AppFormConstants.ADDITIONAL_NOTES).patchValue(res.body.additionalNotes);
        this.createEInvoiceForm.get('additionalData').patchValue(res.body.additionalData);
        this.createEInvoiceForm.get('billItemDetails').patchValue(res.body.recurringInvoiceItemDetails);
        this.createEInvoiceForm.get('adHocWorkflowDetails').patchValue(res.body.vendorRecurringTemplateAdHocWorkflowDetailConfigList);
        this.calculateTotal();

      }, error => {
        this.notificationService.errorMessage(error);
      });
    })
  }


  poAndTermChanged(value, name) {
    switch (name) {
      case 'PO': {
        if (!value) {
          this.createEInvoiceForm.get(AppFormConstants.PO_NUMBER).reset();
        }
        this.poList.data.forEach((value1) => {
          if (value === value1.id) {
            this.createEInvoiceForm.get(AppFormConstants.PO_NUMBER).patchValue(value1.name);
          }
        });
        break;
      }
      case 'TERM': {
        if (!value) {
          this.createEInvoiceForm.get(AppFormConstants.TERM_NAME).reset();
        }
        this.termList.data.forEach((value1) => {
          if (value === value1.id) {
            this.createEInvoiceForm.get(AppFormConstants.TERM_NAME).patchValue(value1.name);
          }
        });
        break;
      }
    }
  }

  async getCustomerRelatedData() {
    const tenantId = this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value;
    if (this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value) {

      if (tenantId !== this.previousCustomerIdBeforeChange && this.previousCustomerIdBeforeChange) {
        this.resetEInvoiceForm(false);
        this.previousCustomerIdBeforeChange = tenantId;
        this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(tenantId);
        return;
      }
      this.previousCustomerIdBeforeChange = tenantId;
      await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false, tenantId);
      this.getCustomerRelatedPoList(tenantId);
      this.getApprovalUserList(tenantId);
      this.getApprovalGroupList(tenantId);
      this.getUomList(tenantId);
      this.getPaymentTerms(tenantId);
      if (this.isFromRecurringTemplate) {
        await this.getRecurringInvoiceData();
      }
    }
  }

  /**
   * this method can be used to create e invoice
   * @param value to form values
   */
  createEInvoice(value) {
    this.billMasterDto = Object.assign(this.billMasterDto, value);
    if (this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).value) {
      this.billMasterDto.billDate = this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }

    let existingRecurringInvoiceAttachments = [];
    let vendorRecurringAdditionalFieldAttachments = [];
    this.existingAttachments?.forEach(value => {
      if (value.fieldId) {
        vendorRecurringAdditionalFieldAttachments.push(value);
      } else {
        existingRecurringInvoiceAttachments.push(value);
      }
    })

    this.billMasterDto.existingAttachments = [];
    this.billMasterDto.existingAttachments = existingRecurringInvoiceAttachments;

    this.billMasterDto.existingAdditionalFieldAttachments = [];
    this.billMasterDto.existingAdditionalFieldAttachments = vendorRecurringAdditionalFieldAttachments;

    this.billMasterDto.attachments = this.attachments;

    if (this.createEInvoiceForm.valid) {
      this.createBill(this.billMasterDto);
    } else {
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      new CommonUtility().validateForm(this.createEInvoiceForm);
    }
  }

  /**
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
      this.isClickCloseButton.emit(false);
  }

  /**
   * this method can be used to reset e invoice form
   */
  resetEInvoiceForm(fromBtnClick) {
    this.isAvailableValueApprovalUser = false;
    this.isAvailableValueApprovalGroup = false;
    this.createEInvoiceForm.reset();
    this.itemFields.clear();
    this.headerAdditionalFieldDetails = [];
    this.attachments = [];
    this.approvalUserList.data = [];
    this.poList.data = [];
    this.termList.data = [];
    this.uomList.data = [];
    this.headingSectionArray.controls = [];
    this.itemFields.controls = [];
    this.initAddItems();
    setTimeout(() => {
      this.initApprove();
      this.changeRef.markForCheck();
    }, 100);
    this.matchingAutomation = null;

    this.calculateTotal();
    this.adHocWorkflowDetails.clear();
    if (this.isFromPo && fromBtnClick) {
      this.getPoData();
    }
    if (this.isFromRecurringTemplate && fromBtnClick) {
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(this.tenantIdFrom);
    }

  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.itemFields.removeAt(itemIndex);
  }

  /**
   * this method can be used to get due date
   */
  getDueDate(data, fromTerm, fromNet, fromDue) {
    let dateFormat = this.dateFormat.DATE_FORMAT;
    let billDate = this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).value;
    let netDays = this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).value;
    let dueDate = this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).value;
    let term = this.createEInvoiceForm.get(AppFormConstants.TERM).value;
    let tenantId = this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value;

    if (term == AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).setValidators( Validators.compose([Validators.min(0)]));
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else if (fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    }

    if (!data || !term || !billDate) {
      this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).reset();
      return;
    }
    try {
      billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } catch (e) {
    }

    if (dueDate) {
      try {
        dueDate = dueDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
      }
    }

    if (fromNet) {
      dueDate = null;
    }
    if (fromDue) {
      netDays = null;
    }

    if (!netDays) {
      netDays = 0;
    }

    this.vendorInvoiceService.getDueDate(billDate, dateFormat, term, netDays, dueDate, tenantId).subscribe((res: any) => {
      if (res.body.dueDate) this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue(res.body.dueDate);
      if (res.body.netDaysDue) {
        this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
        this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).markAsDirty();
      }
    });
  }


  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }


  /**
   * This method can be used to select file
   * @param event to change event
   */

  onSelect(event) {
    this.attachments.push(...event.addedFiles);
  }


  /*
    ITEM FORM ARRAY DETAILS-------------------------------------------------------------------------------------------->
   */

  /**
   * This method can use for get controllers in form array
   */
  public get itemFields() {
    return this.createEInvoiceForm.get('billItemDetails') as UntypedFormArray;
  }

  /**
   * this method can be used to init add items
   */

  initAddItems() {
    for (let i = 0; i < 5; i++) {
      this.addItem();
    }
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      productId: [null],
      itemName: [null],
      qty: [null],
      uomId: [null],
      description: [null],
      unitPrice: [null],
      discountAmount: [0.0],
      itemNumber: [''],
      amount: [{value: null, disabled: true}],
      additionalData: this.formBuilder.array([])
    });
    this.itemFields.push(itemInfo);
  }


  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.createEInvoiceForm.get(AppFormConstants.AD_HOCK_WORKFLOW_DETAILS) as UntypedFormArray;
  }

  /**
   * this method can be used to init approve dropdown
   */
  initApprove() {
    this.addAdHocWorkflowDetail();
  }

  /**
   * add new approve
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      approvalOrder: [null],
      approvalGroup: [null],
      approvalUser: [null],
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
  }

  /**
   * remove AddHocWorkflow
   * @param index number
   */
  removeAdHocWorkflow(index: number) {
    this.adHocWorkflowDetails.removeAt(index);
  }


  /**
   * this method can be used to get vendor related po list
   */

  getCustomerRelatedPoList(tenantId) {
    this.vendorInvoiceService.getPoList(tenantId, 0).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get vendor list for dropdown
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
   * this method can be used to get payment terms
   */
  getPaymentTerms(tenantId) {
    this.vendorInvoiceService.getTermsList(tenantId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get date formats
   */
  getApprovalUserList(tenantId) {
    this.vendorInvoiceService.getApprovalUserList(tenantId, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalUserList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get approval group list
   */
  getApprovalGroupList(tenantId) {
    this.vendorInvoiceService.getApprovalGroupList(tenantId, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getUomList(tenantId) {
    this.vendorInvoiceService.getUom(tenantId).subscribe((res: any) => {
      this.uomList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /*
 Validations ---------------------------------------------------------------------------------------------------------------------->
   */

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    const len = (this.itemFields.length) - 1;
    if (len === index) {
      this.addItem();
    }
  }


  /*
  Calculate Total -------------------------------------------------------------------------------------------------->
   */

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case AppConstant.ARROW_DOWN:
        if ((this.itemFields.length) - 2 === i) {
          this.addItem();
        }
        e.preventDefault();
        document.getElementById(name + (i + 1)).focus();
        break;
      case AppConstant.ARROW_UP:
        e.preventDefault();
        if (i !== 0) {
          document.getElementById(name + (i - 1)).focus();
        }
        break;
    }
  }

  calculateTotal() {
    let netAmount: number;
    let taxAmount: number;
    let grossAmount = 0.0;

    this.itemFields.controls.forEach((itemCost, index) => {
      if (itemCost.value.qty && itemCost.value.unitPrice) {
        const sum = itemCost.value.qty * itemCost.value.unitPrice;
        grossAmount += sum;
        this.itemFields.controls[index].get('amount').patchValue(sum);
      }
    });

    this.createEInvoiceForm.get(AppFormConstants.GROSS_AMOUNT).patchValue(grossAmount);
    taxAmount = this.createEInvoiceForm.get(AppFormConstants.TAX).value;
    netAmount = grossAmount + taxAmount;
    this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).patchValue(netAmount);
  }

  /*
  --------------------------------------------------------------------------------------------------------------------------------->
   */


  /**
   * this method can be used to get remaining ceiling
   */
  getRemainingCeiling() {
    if (!this.createEInvoiceForm.get(AppFormConstants.PO_ID).value) {
      return;
    }
    this.vendorInvoiceService.getPoCeling(this.createEInvoiceForm.get(AppFormConstants.PO_ID).value,
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.createEInvoiceForm.get(AppFormConstants.REMAINING_CELING).patchValue((res.body).toString());
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }


  /**
   * this method can be used to upload file list
   * @param event to event
   */
  changeFileList(event) {
    this.attachments.push(...event.addedFiles);
  }

  /**
   * This method will get trigger when on key up discount days field
   */
  onKeyUpDiscountDaysDue() {
    this.isValidDiscountDate = false;
    // tslint:disable-next-line:radix
    const netDaysDue = parseInt(this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).value);
    // tslint:disable-next-line:radix
    const discountDaysDue = parseInt(this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).value);
    if (netDaysDue !== null && discountDaysDue != null) {
      if (netDaysDue < discountDaysDue) {
        this.isValidDiscountDate = true;
      } else {
        this.isValidDiscountDate = false;
        this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).clearValidators();
      }
    } else {
      return;
    }
    this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).updateValueAndValidity();
    this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
  }

  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/


  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView, tenantId) {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getAdditionalField(id, isDetailView, tenantId, !this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, false);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }
          }));
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
      });
    })
  }

  /**
   * this method can be used to manage dropdown data
   * @param field to section object
   */

  public manageDropDownData(field: AdditionalFieldDetailDto) {
    if (field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD) {
      field.optionsList = new DropdownDto();

      if (field.options) {
        field.options.forEach(value => {
          field.optionsList.data.push({id: value.id, name: value.optionValue});
        });
      }

      if (field.createNew && field.createNew === AppConstant.STATUS_APPROVED) {
        field.optionsList.addNew();
      }
    }
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
   * return form array data
   */
  public get headingSectionArray() {
    return this.createEInvoiceForm.get(AppFormConstants.ADDITIONAL_DATA) as UntypedFormArray;
  }

  /**
   * This method use for view additional option input drawer
   * @param event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl) {
    if (event.itemValue === 0 || event.value === 0) {
      additionalField.get(AppFormConstants.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   */
  changeFileInput(event: any, additionalField) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      additionalField.patchValue({
        attachment: targetFile
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
   * this method can be used to bill submit for approved
   */
  createBill(billObj) {
    const billMasterDto = billObj;
    this.isLoading = true;
    // billMasterDto.billItemDetails.forEach((value) => {
    //   if (value.uomId && !value.uomId.id) {
    //     value.uomId = {id: value.uomId};
    //   }
    // });

    billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);

    this.vendorInvoiceService.createEInvoice(billMasterDto,
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.INVOICE_SUBMITTED_SUCCESSFULLY);
        this.isLoading = false;
        this.createEInvoiceForm.reset();
        this.closeEInvoiceCreateMode();
      } else {
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.isLoading = false;
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * validate dropdown value
   * @param value to form control value
   * @param approvalData to approvalData
   */
  validateDropDownValue(value, approvalData) {
    if (value && approvalData.value.approvalUser) {
      approvalData.value.approvalGroup = null;
      this.isAvailableValueApprovalGroup = true;
      this.isAvailableValueApprovalUser = false;
    } else if (value && approvalData.value.approvalGroup) {
      approvalData.value.approvalUser = null;
      this.isAvailableValueApprovalGroup = false;
      this.isAvailableValueApprovalUser = true;
    } else {
      this.isAvailableValueApprovalGroup = false;
      this.isAvailableValueApprovalUser = false;
    }
  }

  downloadAttachment(item: any) {
    this.billsService.downloadRecurringAttachment(item.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', item.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  deleteAttachmentOnEdit(i: any) {
    this.existingAttachments.splice(i, 1);
  }
}
