import {Component, Input, OnInit, Output, EventEmitter, HostListener, ViewChild, Renderer2, ElementRef, OnDestroy} from '@angular/core';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {PoService} from '../../../shared/services/po/po.service';
import {MessageService} from 'primeng/api';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PoUtility} from '../po-utility';
import {RoleService} from '../../../shared/services/roles/role.service';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {PoApprovalButtonsComponent} from '../po-approval-buttons/po-approval-buttons.component';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {MandatoryFields} from "../../../shared/utility/mandatory-fields";
import {Subscription} from 'rxjs';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {DataFormatToISODate} from "../../../shared/utility/data-format-toISODate";

@Component({
  selector: 'app-po-approve',
  templateUrl: './po-approve.component.html',
  styleUrls: ['./po-approve.component.scss']
})
export class PoApproveComponent extends MandatoryFields implements OnInit, OnDestroy {
  public smallHorSplitter = false;
  public extraSmallHorSplitter = true;
  public poNo: any;
  public poDetail: PoMasterDto = new PoMasterDto();
  public appFieldType = AppFieldType;
  public poHeadingAdditionalFields: AdditionalFieldDetailDto[] = [];
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  private additionalFieldResponse: AdditionalFieldDetailDto [] = [];
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public adHocWorkflowDetails: any [] = [];
  public accountList: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public poUtility: PoUtility = new PoUtility(this.poService, this.roleService, this.messageService,
    this.privilegeService, this.notificationService, this.drawerService, this.billsService);
  public commonUtil: CommonUtility = new CommonUtility();
  public purchaseOrderApprovalMainForm: UntypedFormGroup;
  public currentPOIndex = 0;
  public poIdList: number[] = [];
  public screenSize: any;
  public responsiveSize;
  public needToRefresh = false;
  public grossAmount: any;
  public taxAmount: any;
  public taxPercentageStr: any = 0.0;
  public taxPercentage: any;
  public discountAmount: number;
  public accountGrossAmount: number;
  public itemGrossAmount: number;
  public netAmount: any;
  public attachmentId;

  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();


  @Input() poId;
  @Input() isDetailView;
  @Input() isApproveView;
  @Input() fromDashboard;
  @Input() fromNotification;
  @Input() poNumber;
  @Input() tableSearchResults;
  @Input() isFromReport = false;
  @Output() closePOApprove: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('poApprovalButtonsComponent') public poApprovalButtonsComponent: PoApprovalButtonsComponent;


  constructor(public poService: PoService, public notificationService: NotificationService, public messageService: MessageService,
              public formBuilder: UntypedFormBuilder, public roleService: RoleService,
              public additionalFieldService: AdditionalFieldService,
              public billApprovalsService: BillApprovalsService, public privilegeService: PrivilegeService, public billsService: BillsService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService, public automationService: AutomationService,
              private renderer: Renderer2, private el: ElementRef) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    this.purchaseOrderApprovalMainForm = this.formBuilder.group({
      id: [null],
      poNumber: [null],
      poDate: [{value: null, disabled: true}],
      vendorName: [null],
      projectNo: [null],
      deliveryDate: [{value: null, disabled: true}],
      pocName: [null],
      departmentName: [null],
      pocPhone: [],
      notes: [null],
      shippingAddress: [null],
      billingAddress: [null],
      event: [null],
      uomName: [null],
      netAmount: [null],
      vendorId: [null],
      projectCodeId: [null],
      focusListener: [],
      patchSetFieldFullObject: [true],
      departmentId: [null],
      additionalData: this.formBuilder.array([]),
      purchaseOrderDetails: this.formBuilder.array([]),
      purchaseOrderAccountDetails: this.formBuilder.array([]),
    });

    this.getRequiredFields(this.purchaseOrderApprovalMainForm, AppDocumentType.BILL);
    this.getPendingPOList();
    this.getAccounts(this.accountList);


    this.fieldSubscription = this.automationService.updateFocusListeners.subscribe(value => {
      if (value && value.automationMst) {
        this.matchingAutomation = value.automationMst.automationWorkflowConfigs;
        this.isSubmissionWorkFlow = !value.automationMst.saveAsApprovedEnabled;
        this.isSaveAsApprovedWorkFlow = value.automationMst.saveAsApprovedEnabled;
        this.isWorkflowConfigAvailable = value.automationMst.workflowConfigAvailable;
      } else {
        this.clearAutomation();
      }
    });
  }

  setDocumentEvent() {
    this.purchaseOrderApprovalMainForm.get('event').patchValue(AppDocuments.DOCUMENT_EVENT_APPROVED);
    this.purchaseOrderApprovalMainForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);

  }

  /**
   * This method use for get pending po list ids
   */
  getPendingPOList() {
    if (this.fromNotification) {
      this.getPoDetails(this.poId);
      return;
    }

    if (!this.tableSearchResults) {
      return;
    }
    this.clearAutomation();
    this.poService.getAllPendingPurchaseOrders(this.tableSearchResults, !this.isDetailView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poIdList = res.body;
        if (this.poIdList.length === 0) {
          this.close();
        } else {
          if (this.poIdList.includes(this.poId)) {
            this.currentPOIndex = this.poIdList.findIndex(x => x === this.poId);
            this.getPoDetails(this.poIdList[this.currentPOIndex]);
          } else {
            this.getPoDetails(this.poIdList[0]);
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
   * Get Po Details for Specific Po
   * @param id poReceiptID
   */
  getPoDetails(id: number) {
    this.purchaseOrderApprovalMainForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);
    this.automationService.setUpFocusListeners(this.purchaseOrderApprovalMainForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.PURCHASE_ORDER,
      this.automationService.poInputFieldsForAutomation);
    this.needToRefresh = true;
    if (id) {
      this.resetForm();
      this.poService.getPoData(id, false).subscribe(async (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
          this.adHocWorkflowDetails = this.adHocWorkflowDetails.sort((ap1, ap2) =>
              (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
          this.poDetail = res.body;
          this.getVendorItemList(res.body.vendorId);
          this.poNo = res.body.poNumber;
          this.poId = res.body.id;
          this.attachmentId = res.body.attachmentId;
          this.needToRefresh = false;
          this.poService.vendorId.next(res.body.vendorId);
          if (res.body.poAttachments) {
            res.body.poAttachments.forEach((value) => {
              if (!(!this.isDetailView && value.id === this.attachmentId)) {
                this.poDetail.additionalFieldAttachments.push(value);
              }
            });
          }

          for (let i = 0; i < this.poDetail.purchaseOrderDetails.length; i++) {
            this.addItem();
          }
          for (let i = 0; i < this.poDetail.purchaseOrderAccountDetails.length; i++) {
            this.addAccount();
          }
          await this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER, true);

          this.poDetail.additionalData = this.commonUtil.patchDropDownAdditionalData(this.poDetail.additionalData);
          this.poDetail.purchaseOrderDetails = this.commonUtil.patchDropDownAdditionalLineItemData(this.poDetail.purchaseOrderDetails);
          this.poDetail.purchaseOrderAccountDetails = this.commonUtil.patchDropDownAdditionalLineItemData(this.poDetail.purchaseOrderAccountDetails);

          this.poDetail.additionalData = this.commonUtil.alignHeadingAdditionalData(this.poHeadingAdditionalFields, this.poDetail.additionalData);
          this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderDetails, this.lineItemAdditionalFieldDetails);
          this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderAccountDetails, this.accountAdditionalFieldDetails);

          this.grossAmount = this.poDetail.grossAmount;
          this.taxAmount = this.poDetail.taxAmount;
          this.taxPercentageStr = this.poDetail.taxPercentageStr;
          this.taxPercentage = this.poDetail.taxPercentage;
          this.discountAmount = this.poDetail.discountAmount;
          this.netAmount = this.poDetail.netAmount;
          this.itemGrossAmount = this.poDetail.itemGrossAmount;
          this.accountGrossAmount = this.poDetail.accountGrossAmount;

          if (this.poDetail.taxPercentage) {
            let totalGrossAmount = 0.0;
            let accountGrossAmount = 0.0;
            let itemGrossAmount = 0.0;
            let taxPercentage = 0.0;
            itemGrossAmount = Number(this.poDetail.itemGrossAmount);
            accountGrossAmount = Number(this.poDetail.accountGrossAmount);
            totalGrossAmount = (itemGrossAmount + accountGrossAmount);
            taxPercentage = Number(this.poDetail.taxPercentage);
            this.poDetail.taxAmount = totalGrossAmount * (taxPercentage / 100);
          }

          if (this.poDetail.poDate) {
            try {
              let poDate = new Date(this.poDetail.poDate);
              this.poDetail.poDate = poDate;
            } catch (e) {
            }
          }
          if (this.poDetail.deliveryDate) {
            try {
              let deliveryDate = new Date(this.poDetail.deliveryDate);
              this.poDetail.deliveryDate = deliveryDate;
            } catch (e) {
            }
          }
          this.getTableRowValues(this.poDetail);
          this.purchaseOrderApprovalMainForm.patchValue(this.poDetail);
          this.setDocumentEvent();
          this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method used to get vendor related item list
   */
  getVendorItemList(selectedVendorId) {
    if (selectedVendorId) {
      this.billsService.getItemListByVendorId(selectedVendorId).subscribe((res: any) => {
        this.vendorRelevantItemList.data = res.body;
      });
    }
  }


  /**
   * this method can be used to reset existing view
   */
  resetForm() {
    this.poHeadingAdditionalFields = [];
    this.lineItemAdditionalFieldDetails = [];
    this.accountAdditionalFieldDetails = [];
    this.accountDetails.controls = [];
    this.headingAdditionalFields.controls = [];
    this.lineItemMainTable.controls = [];
  }

  /**
   * Get next Po Details
   */
  poNext() {
    this.currentPOIndex++;
    const currentPoID = this.poIdList[this.currentPOIndex];
    this.getPoDetails(currentPoID);

    this.poId = null;
    this.poDetail = null;
  }

  /**
   * Get previous Po Details
   */
  poPrev() {
    this.currentPOIndex--;
    const currentPoID = this.poIdList[this.currentPOIndex];
    this.getPoDetails(currentPoID);

    this.poId = null;
    this.poDetail = null;
  }


  /**
   * Next Button Enable
   */
  isNextDisable() {
    if (this.fromNotification === true) {
      return true;
    }

    if (this.poIdList === null || this.poIdList === undefined || this.poIdList.length === 0) {
      return false;
    }
    return (this.poIdList.length <= ((this.currentPOIndex + 1)));
  }

  /**
   * Previous Button Enable
   */
  isPreviousDisable() {
    if (this.fromNotification === true) {
      return true;
    }

    if (this.poIdList === null || this.poIdList === undefined || this.poIdList.length === 0) {
      return false;
    }
    return (this.poIdList.indexOf(Number(this.poIdList[(this.currentPOIndex)]))) === 0;
  }

  /**
   * Close Po Drawer
   */
  close() {
    this.closePOApprove.emit(false);
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    this.smallHorSplitter = !((this.screenSize / 2) > parseInt(size[0]));
    this.extraSmallHorSplitter = !(((size[0] / 4) * 2) - 150 >= (this.screenSize / 4));

  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenSize = window.innerWidth;
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [],
      productId: [null],
      itemName: [null],
      itemNumber: [null],
      vendorItemNumber: [null],
      qty: [0],
      accountId: [null],
      accountNumber: [null],
      uomId: [null],
      uomName: [null],
      description: [null],
      departmentName: [null],
      unitPrice: [0.0],
      discountAmount: [0.0],
      billableStr: [null],
      taxableStr: [null],
      amount: [{value: null, disabled: true}],
      additionalData: this.formBuilder.array([])
    });
    this.lineItemMainTable.push(itemInfo);
  }

  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.additionalFieldResponse = res.body;
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
          resolve(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }

      }, error => {
        this.notificationService.errorMessage(error);
      });
    });

  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForAccounts(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poDetail.purchaseOrderAccountDetails, field, true, false)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    if (this.accountDetails.controls.length > 0) {
      this.accountDetails.controls.forEach((value, index) => {
        this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailView));
      });
    }
  }


  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poDetail.purchaseOrderDetails, field, true, false)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    if (this.lineItemMainTable.controls.length > 0) {
      this.lineItemMainTable.controls.forEach((value, index) => {
        this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailView));
      });
    }
  }


  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.poHeadingAdditionalFields.push(field);
    this.headingAdditionalFields.push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailView));
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
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.purchaseOrderApprovalMainForm.get('purchaseOrderDetails') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get headingAdditionalFields() {
    return this.purchaseOrderApprovalMainForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public lineItemAdditionalField(index) {
    return this.lineItemMainTable.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * this method can be used to get selected item/account names
   */
  getTableRowValues(poDetail) {
    if (poDetail.purchaseOrderAccountDetails.length > 0) {
      poDetail.purchaseOrderAccountDetails.forEach((value, index) => {
        this.getAccountName(value.accountId, index);
      });
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i) {
    this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.accountDetails.controls[i].get('accountNumber').patchValue(res.body.number);
        this.accountDetails.controls[i].get('accountName').patchValue(res.body.name);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Decides Whether a additional attachment download or not
   */
  downloadAttachments(val) {
    if (val.fieldId) {
      this.downloadAdditionalAttachments(val);
    } else {
      this.downloadSystemAttachments(val);
    }
  }

  downloadSystemAttachments(val: any) {
    this.poService.downloadPoAttachment(val.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to download additional attachments
   * @param val to item object
   */

  downloadAdditionalAttachments(val) {
    this.poService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.billsService.getAccountList().subscribe((res: any) => {
      listInstance.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  get po() {
    return this.purchaseOrderApprovalMainForm.controls;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      description: [null],
      departmentId: [null],
      amount: [null],
      projectId: [null],
      billableStr: [null],
      taxableStr: [null],
      departmentName: [null],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public accountAdditionalField(index) {
    return this.accountDetails.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get accountDetails() {
    return this.purchaseOrderApprovalMainForm.get('purchaseOrderAccountDetails') as UntypedFormArray;
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  ngOnDestroy(): void {
    this.automationService.cleanupListeners();
  }
}
