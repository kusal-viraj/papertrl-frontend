import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PoUtility} from '../po-utility';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PoService} from '../../../shared/services/po/po.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {RoleService} from '../../../shared/services/roles/role.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';

@Component({
  selector: 'app-po-detail-view',
  templateUrl: './po-detail-view.component.html',
  styleUrls: ['./po-detail-view.component.scss']
})
export class PoDetailViewComponent implements OnInit , OnDestroy {

  public smallHorSplitter = false;
  public extraSmallHorSplitter = true;
  public poNo: any;
  public poDetail: PoMasterDto = new PoMasterDto();
  public appFieldType = AppFieldType;
  public appAuthorities = AppAuthorities;
  public poHeadingAdditionalFields: AdditionalFieldDetailDto[] = [];
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  private additionalFieldResponse: AdditionalFieldDetailDto [] = [];
  public adHocWorkflowDetails: any [] = [];
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
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
  public taxAmount: any;
  public discountAmount: number;
  public accountGrossAmount: number;
  public itemGrossAmount: number;
  public netAmount: any;
  public taxPercentageStr: string;
  public taxPercentage: any;
  public isEditPo = false;
  public isSuccessFromEditView = false;
  public showIframeHider = false;
  public attachmentId: any = null;

  /* This property get for check bill status through enum */
  public enums = AppEnumConstants;


  @Input() poId;
  @Input() fromNotification;
  @Input() poNumber;
  @Input() tableSearchResults;
  @Input() isFromReport = false;
  @Output() closePOApprove: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() deletedPOEmitter: EventEmitter<boolean> = new EventEmitter();
  @Output() isCloseApproveView = new EventEmitter();
  @Input() poStatusFromList: any;
  @Input() tableSupportBase: any;
  @Input() hasUserInApprovalGroupOrAssignee = false;
  approvePoView = false;
  public poObj: any;



  constructor(public poService: PoService, public notificationService: NotificationService, public messageService: MessageService,
              public formBuilder: UntypedFormBuilder, public roleService: RoleService, public additionalFieldService: AdditionalFieldService,
              public billApprovalsService: BillApprovalsService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService,
              public confirmationService: ConfirmationService, public config: DynamicDialogConfig, public detailViewService: DetailViewService, public billsService: BillsService) {
  }

  ngOnDestroy(): void {
    this.detailViewService.closePoDetailView();
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.poId = this.config.data.id;
      this.fromNotification = true;
    }
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    this.purchaseOrderApprovalMainForm = this.formBuilder.group({
      id: [null],
      poNumber: [{value: null, disabled: true}],
      poDate: [{value: null, disabled: true}],
      vendorName: [{value: null, disabled: true}],
      projectNo: [{value: null, disabled: true}],
      deliveryDate: [{value: null, disabled: true}],
      pocName: [{value: null, disabled: true}],
      departmentName: [{value: null, disabled: true}],
      pocPhone: [{value: null, disabled: true}],
      notes: [{value: null, disabled: true}],
      shippingAddress: [{value: null, disabled: true}],
      billingAddress: [{value: null, disabled: true}],
      event: [null],
      uomName: [null],
      netAmount: [null],
      vendorId: [null],
      projectCodeId: [null],
      departmentId: [null],
      additionalData: this.formBuilder.array([]),
      purchaseOrderDetails: this.formBuilder.array([]),
      purchaseOrderAccountDetails: this.formBuilder.array([]),
    });
    this.getPendingPOList();
  }

  get f() {
    return this.purchaseOrderApprovalMainForm.controls;
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

    this.poService.getAllPendingPurchaseOrders(this.tableSearchResults, false).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poIdList = res.body;
        if (this.poIdList.length === 0) {
          this.close();
          this.closePOApprove.emit();
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
    if (id) {
      this.resetForm();
      this.needToRefresh = true;
      this.poService.getPoData(id, true).subscribe(async (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
          this.adHocWorkflowDetails = this.adHocWorkflowDetails.sort((ap1, ap2) =>
              (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
          this.poDetail = res.body;
          this.hasUserInApprovalGroupOrAssignee = this.isValidApproveAccess(this.poDetail);
          this.poNo = res.body.poNumber;
          this.poId = res.body.id;
          this.attachmentId = res.body.attachmentId;
          this.needToRefresh = false;
          this.poService.vendorId.next(res.body.vendorId);
          if (res.body.poAttachments) {
            res.body.poAttachments.forEach((value) => {
              if (!(value.id === this.attachmentId)) {
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

          this.poDetail.additionalData = this.commonUtil.alignHeadingAdditionalData(this.poHeadingAdditionalFields, this.poDetail.additionalData);
          this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderDetails, this.lineItemAdditionalFieldDetails);
          this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderAccountDetails, this.accountAdditionalFieldDetails);

          this.taxPercentageStr = this.poDetail.taxPercentageStr;
          this.taxPercentage = this.poDetail.taxPercentage;
          this.discountAmount = this.poDetail.discountAmount;
          this.netAmount = this.poDetail.netAmount;
          this.itemGrossAmount = this.poDetail.itemGrossAmount;
          this.accountGrossAmount = this.poDetail.accountGrossAmount;
          if (this.poDetail.poDate) {
            try {
              const poDate = new Date(this.poDetail.poDate);
              this.poDetail.poDate = poDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
            } catch (e) {
            }
          }
          if (this.poDetail.deliveryDate) {
            try {
              const deliveryDate = new Date(this.poDetail.deliveryDate);
              this.poDetail.deliveryDate = deliveryDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
            } catch (e) {
            }
          }
          this.purchaseOrderApprovalMainForm.patchValue(this.poDetail);

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
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
    this.poId = currentPoID;
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
    this.poId = currentPoID;
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
    if (this.config?.data) {
      this.detailViewService.closePoDetailView();
      return;
    }
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
      qty: [null],
      uomId: [null],
      uomName: [null],
      departmentId: [null],
      departmentName: [null],
      accountId: [null],
      accountNumber: [null],
      unitPrice: [null],
      description: [null],
      discountAmount: [null],
      billableStr: [null],
      taxableStr: [null],
      amount: [null],
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
    if (!isNotNullOrUndefined(id)) {
      return;
    } else {
      return new Promise<void>(resolve => {
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
        this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
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
        this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
      });
    }
  }


  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.poHeadingAdditionalFields.push(field);
    this.headingAdditionalFields.push(this.commonUtil.getAdditionalFieldValidations(field, true));
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
      console.log('start download:', res);
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
      console.log('start download:', res);
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
   * This method use for add new form controller group for automation condition
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      description: [null],
      departmentId: [null],
      departmentName: [null],
      amount: [null],
      projectId: [null],
      billableStr: [null],
      taxableStr: [null],
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

  /**
   * this method can be used to delete bill
   */
  deleteBill(id) {
    if (!id) {
      return;
    }
    this.confirmationService.confirm({
      key: 'poDeleteFromDetailView',
      message: 'You want to delete this Purchase Order',
      accept: () => {
        this.poService.deletePurchaseOrder(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(AppHttpResponseMessage.PO_ORDER_DELETED_SUCCESSFULLY);
            this.deletedPOEmitter.emit();
            this.close();
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
   * This method can use for edit PO
   */

  editPO() {
    this.poService.canEdit(this.poId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isEditPo = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to check privileges for po approve
   */

  checkPrivilegesForPOApprove() {
    const hasRequiredPrivilege = this.privilegeService.isAuthorizedMultiple(
      [this.appAuthorities.PURCHASE_ORDER_APPROVE, this.appAuthorities.PURCHASE_ORDER_REJECT,
        this.appAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]);

    const isPOPending = (this.poDetail?.status === this.enums.STATUS_PENDING);
    return (hasRequiredPrivilege && isPOPending && this.hasUserInApprovalGroupOrAssignee);
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(poObj) {

    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, poObj) || this.isApprovalGroupUserExist(user.username, poObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, poObj) {
    if (!poObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(poObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, poObj) {
    if (!poObj.approvalUser) {
      return false;
    }

    return approvalUser === poObj.approvalUser;
  }

  /**
   * This method can be used to open po approve view
   */
  approvePo() {
    this.approvePoView = true;
  }
}
