import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ExpenseUtility} from '../expense-utility';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ConfirmationService} from 'primeng/api';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {ExpenseTableDto} from "../../../shared/dto/expense/expense-table-dto";
import {TableSupportBase} from "../../../shared/utility/table-support-base";

@Component({
  selector: 'app-expense-detail-view',
  templateUrl: './expense-detail-view.component.html',
  styleUrls: ['./expense-detail-view.component.scss']
})
export class ExpenseDetailViewComponent implements OnInit, OnDestroy {

  public responsiveSize;
  public screenSize: number;
  public auditTrialPanel: boolean;
  public netAmount: any;
  public isSplitterSmall = false;
  public extraSmallHorSplitter = true;
  public isLoading = false;
  public isRejectLoading = false;
  public rejectComment: any;
  public isAddNewProjectCodes = false;
  public attachmentId: any;
  public expenseCurrentIndex: any;
  public isAddNewAccount = false;
  public isAddNewUser = false;
  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public editExpense = false;
  public expenseApproveForm: UntypedFormGroup;
  public appIcons = AppIcons;
  public expenseUtility: ExpenseUtility = new ExpenseUtility(this.expenseService, this.notificationService, this.privilegeService, this.drawerService, this.billsService);
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public tempExpenseMaster: any = {};
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public commonUtil: CommonUtility = new CommonUtility();
  private additionalFieldResponse: AdditionalFieldDetailDto [] = [];
  public auditTrial: AuditTrialDto [] = [];
  public additionalFieldAttachments: any [] = [];
  public adHocWorkflowDetails: any [] = [];
  public expenseAttachments: any [] = [];
  public approvalUserList: DropdownDto = new DropdownDto();
  public expenseIdList: any[] = [];
  public appFieldType = AppFieldType;
  public appAuthorities = AppAuthorities;
  public needToRefresh = true;
  approveExpenseView =  false;

  constructor(public expenseService: ExpenseService, public notificationService: NotificationService, public formBuilder: UntypedFormBuilder,
              public privilegeService: PrivilegeService, public additionalFieldService: AdditionalFieldService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService, public billsService: BillsService,
              public confirmationService: ConfirmationService, public config: DynamicDialogConfig, public detailViewService: DetailViewService) {
  }


  @Input() fromNotification;
  @Input() expenseId;
  @Input() fromExpenseNoClick = false;
  @Input() reportName: any;
  @Output() closeExpenseApprove = new EventEmitter<boolean>();
  @Output() deleteExpenseFromDetailView = new EventEmitter();
  @Input() expenseSearchFilterDto: TableSearchFilterDataDto;
  @Input() public additionalLineItemAdditionalData: AdditionalFieldDetailDto [] = [];
  @Input() hasUserInApprovalGroupOrAssignee = false;

  public appConstant: AppConstant = new AppConstant();
  public activeAction: ExpenseTableDto = new ExpenseTableDto();

  ngOnDestroy(): void {
    this.detailViewService.closeExpenseDetailView();
  }

  ngOnInit() {
    if (this.config?.data) {
      this.expenseId = this.config.data.id;
      this.fromNotification = true;
    }
    this.expenseApproveForm = this.formBuilder.group({
      id: [],
      uuid: [],
      reportName: [null],
      createdOn: [null],
      createdByName: [null],
      createdBy: [null],
      totalAmount: [null],
      status: [null],
      approvalUser: [],
      endDateStr: [],
      startFromStr: [],
      remarks: [],
      attachmentId: [],
      departmentName: [],
      notes: [],
      vendorName: [null],
      businessPurpose: [null],
      additionalData: this.formBuilder.array([]),
      expenseDetails: this.formBuilder.array([]),
      event: [null],
      totalMileageAmount: [null],
      totalMilesDriven: [null]
    });
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    this.getPendingExpenseList();
  }

  get f() {
    return this.expenseApproveForm.controls;
  }


  /**
   * Get Expense Details for Specific Expense
   * @param id poReceiptID
   */
  getExpenseDetails(id) {
    this.needToRefresh = false;
    this.expenseMasterDto = new ExpenseMasterDto();
    this.expenseApproveTableFormArray.controls = [];
    this.headingAdditionalFields.controls = [];
    this.expenseApproveTableFormArray.reset();
    this.headingAdditionalFields.reset();
    this.expenseApproveForm.reset();
    this.expenseService.getExpenseDetails(id, true).subscribe((res: any) => {
      this.needToRefresh = true;
      this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
      this.adHocWorkflowDetails = this.adHocWorkflowDetails.sort((ap1, ap2) =>
      (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
      if (res.body.expenseAttachments) {
        res.body.expenseAttachments.forEach((value, index) => {
          if (value.id === res.body.attachmentId) {
            res.body.expenseAttachments.splice(index, 1);
          }
        });
      }
      if (res.body.additionalFieldAttachments) {
        res.body.additionalFieldAttachments.forEach((value) => {
          res.body.expenseAttachments.push(value);
        });
      }
      this.expenseMasterDto = res.body;
      this.hasUserInApprovalGroupOrAssignee = this.isValidApproveAccess(this.expenseMasterDto);
      this.tempExpenseMaster = this.expenseMasterDto;
      this.attachmentId = res.body.attachmentId;
      this.reportName = res.body.reportName;
      this.expenseAttachments = res.body.expenseAttachments;
      this.additionalFieldAttachments = res.body.additionalFieldAttachments;
      this.expenseMasterDto.createdOn = new Date(res.body.createdOn);
      this.lineItemAdditionalFieldDetails = [];
      this.headerAdditionalFieldDetails = [];
      this.getModuleReheatedAdditionalField(AppDocumentType.EXPENSE_REPORT, true, this.expenseMasterDto);
      if (res.body.expenseDetails.length > 0) {
        res.body.expenseDetails.forEach((value) => {
          this.initFormArray();
        });
      } else {
        this.initFormArray();
      }
    });
  }


  /**
   * This method use for add additional fields to expense approval
   */
  getModuleReheatedAdditionalField(id, isDetailView, expenseMasterDto) {
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
        }));

        expenseMasterDto.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, expenseMasterDto.additionalData);
        this.commonUtil.alignLineAdditionalData(expenseMasterDto.expenseDetails, this.lineItemAdditionalFieldDetails);

        this.expenseApproveForm.patchValue(expenseMasterDto);
        this.expenseApproveForm.get('approvalUser').setValue(null);

      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingAdditionalFields.push(this.commonUtil.getAdditionalFieldValidations(field, true));
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.expenseMasterDto.expenseDetails, field, true, false)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    if (this.expenseApproveTableFormArray.controls.length > 0) {
      this.expenseApproveTableFormArray.controls.forEach((value, index) => {
        this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
      });
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get headingAdditionalFields() {
    return this.expenseApproveForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public lineItemAdditionalField(index) {
    return this.expenseApproveTableFormArray.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * this method can be used to download attachment
   * @param attachment to attachment
   */
  downloadAttachments(attachment) {
    if (attachment.fieldId) {
      this.downloadAdditionalFieldAttachment(attachment);
    } else {
      this.expenseUtility.commonDownloadAttachment(attachment);
    }
  }

  /**
   * this method can be used to download additional attachment
   * @param val to attachment
   */
  downloadAdditionalFieldAttachment(val) {
    this.expenseService.downloadAdditionalFieldAttachment(val.id).subscribe((res: any) => {
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
   * Get next Expense Details
   */
  next() {
    this.expenseCurrentIndex++;
    const currentPoID = this.expenseIdList[this.expenseCurrentIndex];
    this.expenseId = currentPoID;
    if (currentPoID !== undefined) {
      this.getExpenseDetails(currentPoID);
    }
  }

  /**
   * Get previous Expense Details
   */
  prev() {
    this.expenseCurrentIndex--;
    const currentID = this.expenseIdList[this.expenseCurrentIndex];
    this.expenseId = currentID;
    if (currentID !== undefined) {
      this.getExpenseDetails(currentID);
    }
  }


  /**
   * Next Button Enable
   */
  isNextDisable() {
    if (this.fromNotification === true) {
      return true;
    }

    if (this.expenseIdList === null || this.expenseIdList === undefined || this.expenseIdList.length === 0) {
      return false;
    }
    return (this.expenseIdList.length <= ((this.expenseCurrentIndex + 1)));
  }

  /**
   * Previous Button Enable
   */
  isPreviousDisable() {
    if (this.fromNotification === true) {
      return true;
    }
    if (this.expenseIdList === null || this.expenseIdList === undefined || this.expenseIdList.length === 0) {
      return false;
    }
    return (this.expenseIdList.indexOf(Number(this.expenseIdList[(this.expenseCurrentIndex)]))) === 0;
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    this.isSplitterSmall = !((this.screenSize / 2) > parseInt(size[0]));
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
   * Close Drawer
   */
  close() {
    if (this.config?.data) {
      this.detailViewService.closeExpenseDetailView();
      return;
    }
    this.closeExpenseApprove.emit(false);
  }

  /*
   * form array----------------------------------------------------------------------------------------------------------------->
   */


  public get expenseApproveTableFormArray() {
    return this.expenseApproveForm.get('expenseDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addExpenseFormArray() {
    const expenseTableDataInfo = this.formBuilder.group({
      id: [],
      expenseDate: [null],
      projectCodeId: [null],
      merchant: [null],
      expenseAccountCode: [null],
      expenseType: [null],
      amount: [],
      accountId: [],
      departmentName: [],
      projectAccountCode: [],
      attachmentId: [],
      expenseDateStr: [],
      billableStr: [null],
      taxableStr: [null],
      receiptAttachment: [],
      mileage: [],
      receiptId: [],
      receiptFileName: [],
      mileageRate: [],
      mileageAmount: [],
      additionalData: this.formBuilder.array([]),
    });
    this.expenseApproveTableFormArray.push(expenseTableDataInfo);
  }

  /**
   * this method can be used to init form array
   */
  initFormArray() {
    this.addExpenseFormArray();
  }

  /**
   * this method can be used to get approval status
   * @param status to get status
   */

  getStatus(status) {
    if (status === AppEnumConstants.STATUS_PENDING) {
      return AppEnumConstants.LABEL_PENDING;
    }
    if (status === AppEnumConstants.STATUS_REJECT) {
      return AppEnumConstants.LABEL_REJECT;
    }
    if (status === AppEnumConstants.STATUS_APPROVED) {
      return AppEnumConstants.LABEL_APPROVED;
    }
  }


  /**
   * get pending expense list
   */
  getPendingExpenseList() {
    if (this.fromNotification) {
      this.getExpenseDetails(this.expenseId);
      return;
    }
    this.expenseService.getSubmitPendingExpenses(this.expenseSearchFilterDto, false).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.expenseIdList = res.body;
        if (this.expenseIdList.length === 0) {
          this.expenseApproveForm.reset();
          this.close();
          this.closeExpenseApprove.emit();
        } else {
          if (this.expenseIdList.includes(this.expenseId)) {
            this.expenseCurrentIndex = this.expenseIdList.findIndex(x => x === this.expenseId);
            this.getExpenseDetails(this.expenseIdList[this.expenseCurrentIndex]);
          } else {
            this.getExpenseDetails(this.expenseIdList[0]);
          }
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }


  /**
   * this method can be used to download method
   * @param receiptIndex to index
   */
  downloadReceipt(receiptIndex) {
    if (!this.f.expenseDetails.value[receiptIndex].attachmentId) {
      return;
    }
    const receiptAttachmentId = this.expenseApproveTableFormArray.controls[receiptIndex].get('receiptAttachment').value;
    this.expenseUtility.commonDownloadAttachment(receiptAttachmentId);
  }


  /**
   * this method can be used to download attachment
   */
  downloadAttachment(attachmentId) {
    if (attachmentId != null) {
      this.expenseService.downloadAttachment(this.attachmentId).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.reportName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for load edit drawer
   */
  loadEditDrawer() {
    this.edit();
  }

  /**
   * This method use for check whether can be performed edit action
   */
  edit() {
    this.expenseService.canEdit(this.expenseId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.clear();
        this.editExpense = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for delete expense
   */

  deleteExpense(id) {
    if (!id) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'deleteExp',
        message: 'You want to delete this Expense',
        accept: () => {
          this.expenseService.deleteExpense(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.EXPENSE_DELETED_SUCCESSFULLY);
              this.getPendingExpenseList();
              this.deleteExpenseFromDetailView.emit();
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
  }

  /**
   * This method can be used to check privileges for expense approve
   */

  checkPrivilegesForExpenseApprove() {
    const hasRequiredPrivilege = this.privilegeService.isAuthorizedMultiple([
      this.appAuthorities.EXPENSES_APPROVE, this.appAuthorities.EXPENSES_REJECT,
      this.appAuthorities.EXPENSES_OVERRIDE_APPROVAL
    ]);

    const isExpensePending = (this.expenseMasterDto?.status === AppEnumConstants.STATUS_PENDING);

    return (hasRequiredPrivilege && isExpensePending && this.hasUserInApprovalGroupOrAssignee);
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(expObj) {

    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, expObj) || this.isApprovalGroupUserExist(user.username, expObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, expObj) {
    if (!expObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(expObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, expObj) {
    if (!expObj.approvalUser) {
      return false;
    }

    return approvalUser === expObj.approvalUser;
  }

  /**
   * This method can be used to open expense approve view
   */
  loadApproveDrawer() {
    this.approveExpenseView = true;
  }

  protected readonly AppConstant = AppConstant;
}
