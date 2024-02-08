import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ExpenseUtility} from '../expense-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {MandatoryFields} from "../../../shared/utility/mandatory-fields";
import {ExpenseTableDto} from "../../../shared/dto/expense/expense-table-dto";
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {Subscription} from 'rxjs';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {DataFormatToISODate} from "../../../shared/utility/data-format-toISODate";
import {RemoveSpace} from '../../../shared/helpers/remove-space';

@Component({
  selector: 'app-expense-approve',
  templateUrl: './expense-approve.component.html',
  styleUrls: ['./expense-approve.component.scss']
})
export class ExpenseApproveComponent extends MandatoryFields implements OnInit, OnDestroy {

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
  public projectTaskList: DropdownDto = new DropdownDto();
  public expenseApproveForm: UntypedFormGroup;
  public appIcons = AppIcons;
  public expenseUtility: ExpenseUtility = new ExpenseUtility(this.expenseService,
    this.notificationService, this.privilegeService, this.drawerService, this.billsService);
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public tempExpenseMaster: any = {};
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public adHocWorkflowDetails: any [] = [];
  public commonUtil: CommonUtility = new CommonUtility();
  private additionalFieldResponse: AdditionalFieldDetailDto [] = [];
  public auditTrial: AuditTrialDto [] = [];
  additionalFieldAttachments: any [] = [];
  expenseAttachments: any [] = [];
  public approvalUserList: DropdownDto = new DropdownDto();
  public expenseIdList: any[] = [];
  public appFieldType = AppFieldType;

  public appAuthorities = AppAuthorities;
  public needToRefresh = true;
  public departmentPanel: boolean;
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  public isInsertApproverChecked = false;
  public removeSpace: RemoveSpace = new RemoveSpace();

  public submitDate : any;

  constructor(public expenseService: ExpenseService, public notificationService: NotificationService, public formBuilder: UntypedFormBuilder,
              public privilegeService: PrivilegeService, public additionalFieldService: AdditionalFieldService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService, public billsService: BillsService,
              public automationService: AutomationService, private renderer: Renderer2, private el: ElementRef) {
    super(additionalFieldService, notificationService);
  }


  @Input() isDetailView;
  @Input() attId;
  @Input() fromDashboard;
  @Input() fromNotification;
  @Input() expenseId;
  @Input() reportName: any;
  @Input() expenseReportNumber;
  @Output() closeExpenseApprove = new EventEmitter<boolean>();
  @Output() refreshTable = new EventEmitter<boolean>();
  @Input() expenseSearchFilterDto: TableSearchFilterDataDto;
  @Input() public additionalLineItemAdditionalData: AdditionalFieldDetailDto [] = [];
  public department: DropdownDto = new DropdownDto();
  public checked = false;


  public appConstant: AppConstant = new AppConstant();
  public activeAction: ExpenseTableDto = new ExpenseTableDto();


  ngOnInit() {
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
      departmentName: [],
      attachmentId: [],
      notes: [],
      vendorName: [null],
      businessPurpose: [null],
      additionalData: this.formBuilder.array([]),
      expenseDetails: this.formBuilder.array([]),
      event: [null],
      focusListener: [],
      patchSetFieldFullObject: [true],
      totalMileageAmount: [null],
      totalMilesDriven: [null],
      insertApprovar: [false]
    });
    this.getRequiredFields(this.expenseApproveForm, AppDocumentType.EXPENSE);
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    this.expenseApproveForm.get('remarks').valueChanges.subscribe(data => this.changeRemarks(data));
    this.getPendingExpenseList();
    this.getProjectCodeList();
    this.getDepartment();
    this.setDocumentEvent();
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
    this.expenseApproveForm.get('event').patchValue(AppDocuments.DOCUMENT_EVENT_APPROVED);
    this.expenseApproveForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);

  }

  /**
   * get project code list
   */
  getProjectCodeList() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTaskList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDepartment() {
    this.billsService.getDepartment(!this.isDetailView).subscribe((res: any) => {
      this.department.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  changeRemarks(data: any) {
    if (data) {
      this.rejectComment = false;
    }
  }

  /**
   * Get Expense Details for Specific Expense
   * @param id poReceiptID
   */
  getExpenseDetails(id) {
    this.expenseApproveForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);
    this.automationService.setUpFocusListeners(this.expenseApproveForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.EXPENSE, this.automationService.expenseInputFieldsForAutomation);
    this.needToRefresh = false;
    this.expenseMasterDto = new ExpenseMasterDto();
    this.expenseApproveTableFormArray.controls = [];
    this.expenseApproveTableFormArray.reset();
    this.expenseApproveForm.reset();
    this.expenseService.getExpenseDetails(id, false).subscribe((res: any) => {
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
      this.tempExpenseMaster = this.expenseMasterDto;
      this.getApprovalUserListAccordingToVendor(this.approvalUserList, res.body.vendorId);
      this.attachmentId = res.body.attachmentId;
      this.reportName = res.body.reportName;
      this.expenseAttachments = res.body.expenseAttachments;
      this.additionalFieldAttachments = res.body.additionalFieldAttachments;
      const formatDate = DataFormatToISODate.convert(res.body.createdOn);
      this.submitDate = formatDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      // this.expenseMasterDto.createdOn = this.submitDate;
      this.setDocumentEvent();
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

  getApprovalUserListAccordingToVendor(listInstance: DropdownDto, vendorId) {
    if (vendorId) {
      const authorities = [AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
        AppAuthorities.EXPENSES_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(null, authorities, vendorId, true).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          listInstance.data = res.body;
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.getApprovalUserList(listInstance);
    }
  }

  get expense() {
    return this.expenseApproveForm.controls;
  }


  getApprovalUserList(listInstance: DropdownDto) {
    const authorities = [AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
      AppAuthorities.EXPENSES_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserList(null, authorities, true).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
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

        expenseMasterDto.additionalData = this.commonUtil.patchDropDownAdditionalData(expenseMasterDto.additionalData);
        expenseMasterDto.expenseDetails = this.commonUtil.patchDropDownAdditionalLineItemData(expenseMasterDto.expenseDetails);

        expenseMasterDto.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, expenseMasterDto.additionalData);
        this.commonUtil.alignLineAdditionalData(expenseMasterDto.expenseDetails, this.lineItemAdditionalFieldDetails);

        this.expenseApproveForm.patchValue(expenseMasterDto);
        this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
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
    this.headingAdditionalFields.push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailView));
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
        this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailView));
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
      expenseType: [null],
      amount: [],
      accountId: [],
      projectAccountCode: [],
      attachmentId: [],
      departmentId: [],
      expenseDateStr: [],
      billableStr: [null],
      taxableStr: [null],
      receiptAttachment: [],
      mileage: [],
      mileageRate: [],
      mileageAmount: [],
      receiptFileName: [],
      receiptId: [],
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
   * this method can be used to approve bill
   */
  approveAndReassignExpense(isInsertApprover: boolean) {

    if (this.expenseApproveForm.invalid) {
      this.isLoading = false;
      return new CommonUtility().validateForm(this.expenseApproveForm);
    }

    const id = this.expenseApproveForm.get('id').value;
    if (!id) {
      this.isLoading = false;
      return;
    }
    const expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
    expenseMasterDto.additionalData = [];
    expenseMasterDto.id = id;
    expenseMasterDto.approvalUser = this.expenseApproveForm.get('approvalUser').value;
    if (this.expenseApproveTableFormArray.controls.length > 0) {
      this.expenseApproveTableFormArray.controls.forEach((value, index) => {
        expenseMasterDto.expenseDetails[index] = this.expenseApproveTableFormArray.controls[index].value;
      });
    }
    if (this.expenseApproveForm.get('remarks').value) {
      expenseMasterDto.remarks = this.expenseApproveForm.get('remarks').value;
    }
    this.removeAdditionalDataInExpenseMaster(expenseMasterDto);
    expenseMasterDto.expenseAccountIdList = expenseMasterDto.expenseDetails?.map(r => r.accountId)?.filter(x => x);
    expenseMasterDto.projectCodeIdList = expenseMasterDto.expenseDetails?.map(r => r.projectCodeId)?.filter(x => x);
    this.expenseService.approveAndReassign(expenseMasterDto, isInsertApprover).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        isInsertApprover ? this.notificationService.successMessage(HttpResponseMessage.EXPENSES_INSERT_THE_APPROVER_SUCCESSFULLY) :
        this.notificationService.successMessage(HttpResponseMessage.EXPENSE_APPROVED_SUCCESSFULLY);
        this.isLoading = false;
        if (this.fromNotification) {
          this.close();
        } else {
          this.getPendingExpenseList();
          this.isInsertApproverChecked = false;
          this.commonUtil.setApprovalUserValidation(this.expenseApproveForm, this.isInsertApproverChecked);
        }
      } else {
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method remove additional data in expense master object
   * @param expenseMasterDto to expense master object
   */

  removeAdditionalDataInExpenseMaster(expenseMasterDto: ExpenseMasterDto) {
    expenseMasterDto.additionalData = [];

    expenseMasterDto.expenseDetails.forEach(value => {
      if (value.additionalData) {
        value.additionalData = [];
      }
    });
  }

  /**
   * this method can be used to finalize the bill
   */
  approveAndFinalizeExpense() {
    if (this.expenseApproveForm.invalid) {
      this.isLoading = false;
      return new CommonUtility().validateForm(this.expenseApproveForm);
    }

    const id = this.expenseApproveForm.get('id').value;
    if (!id) {
      this.isLoading = false;
      return;
    }
    const expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
    expenseMasterDto.id = id;
    if (this.expenseApproveTableFormArray.controls.length > 0) {
      this.expenseApproveTableFormArray.controls.forEach((value, index) => {
        expenseMasterDto.expenseDetails[index] = this.expenseApproveTableFormArray.controls[index].value;
      });
    }
    if (this.expenseApproveForm.get('remarks').value) {
      expenseMasterDto.remarks = this.expenseApproveForm.get('remarks').value;
    }
    expenseMasterDto.expenseDetails.forEach((value) => {
      if (value.expenseDate) {
        try {
          value.expenseDate = value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        } catch (e) {
        }
      }
    });
    this.removeAdditionalDataInExpenseMaster(expenseMasterDto);
    expenseMasterDto.expenseAccountIdList = expenseMasterDto.expenseDetails?.map(r => r.accountId)?.filter(x => x);
    expenseMasterDto.projectCodeIdList = expenseMasterDto.expenseDetails?.map(r => r.projectCodeId)?.filter(x => x);
    this.expenseService.approveAndFinalize(expenseMasterDto).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.EXPENSE_APPROVED_SUCCESSFULLY);
        this.isLoading = false;
        if (this.fromNotification) {
          this.close();
        } else {
          this.getPendingExpenseList();
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
        this.isLoading = false;
      }

    }, error => {
      this.notificationService.errorMessage(error);
      this.isLoading = false;
    });
  }


  /**
   * this method can be used to reject expense
   */
  rejectExpense() {
    const expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
    expenseMasterDto.id = this.expenseApproveForm.get('id').value;
    if (this.expenseApproveForm.get('remarks').value === null || this.expenseApproveForm.get('remarks').value === '' ||
      this.expenseApproveForm.get('remarks').value === undefined) {
      this.rejectComment = true;
      this.isRejectLoading = false;
    } else {
      expenseMasterDto.remarks = this.expenseApproveForm.get('remarks').value;
      this.expenseService.rejectExpense(expenseMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.EXPENSE_REJECTED_SUCCESSFULLY);
          this.isRejectLoading = false;
          if (this.fromNotification) {
            this.close();
          } else {
            this.getPendingExpenseList();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.isRejectLoading = false;
        }
      }, error => {
        this.notificationService.errorMessage(error);
        this.isRejectLoading = false;
      });
    }
  }

  /**
   * this method can be used to view audit trial
   */
  viewAuditTrial() {
    this.expenseService.getAuditTrial(this.expenseMasterDto.id).subscribe((res: any) => {
      this.auditTrial = res.body;
      this.auditTrialPanel = true;
    });
  }

  /**
   * get pending expense list
   */
  getPendingExpenseList() {
    if (this.fromNotification) {
      this.getExpenseDetails(this.expenseId);
      return;
    }
    this.expenseService.getSubmitPendingExpenses(this.expenseSearchFilterDto, !this.isDetailView).subscribe((res: any) => {
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

  // /**
  //  * get project code list to project code list
  //  * @param listInstance to dropdown instance
  //  */
  // getApprovalUserList(listInstance: DropdownDto) {
  //   this.expenseService.getApprovalUserList(this.expenseMasterDto.createdBy).subscribe((res: any) => {
  //     if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
  //       listInstance.data = res.body;
  //       listInstance.addNew();
  //     }
  //   }, error => {
  //     this.notificationService.errorMessage(error);
  //   });
  // }

  /**
   * this method can be used to download method
   * @param receiptIndex to index
   */
  downloadReceipt(receiptIndex) {
    const receiptAttachmentId = this.expenseApproveTableFormArray.controls[receiptIndex].get('receiptAttachment').value;
    this.expenseUtility.commonDownloadAttachment(receiptAttachmentId);
  }

  /**
   * this method can be used to add new
   */
  changeList(selectionName, selectedId, i) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (selectionName === 'Project' && selectedId === 0) {
      this.expenseApproveTableFormArray.controls[i].get('projectCodeId').reset();
      this.isAddNewProjectCodes = true;
    }
  }


  /**
   * this method can be used to download method
   * @param attachmentId to attachmentId
   */
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
   * Add New Role
   */
  addNewExpenseAccount(name, inputId, i) {
    if (inputId === 0 && name === 'account') {
      this.isAddNewAccount = true;
      this.expenseApproveTableFormArray.controls[i].get('accountId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (name === 'account') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (inputId === 0 && name === 'user') {
      this.isAddNewUser = true;
      this.expenseApproveForm.get('approvalUser').reset();
    }
  }

  changedDepartment(event: any) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseApproveForm.get('departmentId').reset();
    }
  }


  changedDepartmentAccount(event: any, i: any) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseApproveTableFormArray.controls[i].get('departmentId').reset();
    } else {
      const departmentId = event.value;
      this.expenseApproveTableFormArray.controls[i].get('departmentId').patchValue(departmentId);
    }
  }

  protected readonly AppFormConstants = AppFormConstants;

  ngOnDestroy(): void {
    this.automationService.cleanupListeners();
  }

  /**
   * This method use for set isInsertApproverChecked to check box status and reset select approver dropdown in approve screen
   * @param event this parameter get checkbox status
   */
  isInsertApprover(event) {
    this.isInsertApproverChecked = event.checked;

    if (!(this.tempExpenseMaster.noOfLevels === this.tempExpenseMaster.workflowLevel && !this.matchingAutomation) &&
      !this.isInsertApproverChecked) {
      this.expenseApproveForm.get('approvalUser').reset();
    }

    this.commonUtil.setApprovalUserValidation(this.expenseApproveForm, this.isInsertApproverChecked);
  }
}
