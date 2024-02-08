import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AppReportFilterField} from '../../../shared/enums/app-report-filter-field';
import {ReportUtility} from '../report-utility/report-utility';
import {ReportMasterService} from '../../../shared/services/reports/report-master.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ReportFilterDto} from '../../../shared/dto/report/report-filter-dto';
import {MainReportsPageComponent} from '../main-reports-page/main-reports-page.component';
import {AppReportType} from '../../../shared/enums/app-report-type';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {VendorService} from '../../../shared/services/vendors/vendor.service';


@Component({
  selector: 'app-report-main-form',
  templateUrl: './report-main-form.component.html',
  styleUrls: ['./report-main-form.component.scss']
})
export class ReportMainFormComponent implements OnInit {

  public reportMainForm: UntypedFormGroup;

  public reportUtility: ReportUtility = new ReportUtility(this.reportMasterService, this.notificationService,
    this.privilegeService, this.detailViewService, this.billsService, this.automationService);
  public appReportFilters = AppReportFilterField;
  public appReportType = AppReportType;
  public appConstant = AppConstant;
  public projectTaskList: DropdownDto = new DropdownDto();
  @Input() fieldIds: any[] = [];
  @Input() reportId: any;
  @Input() reportName: string;

  public isProgressPo: boolean;
  public isProgressBill: boolean;
  public isProgressExpense: boolean;
  public selectedTransactionTypes: any [] = [];
  public accountList: DropdownDto = new DropdownDto();
  public departmentList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public vendorList: DropdownDto = new DropdownDto();
  public classification: DropdownDto = new DropdownDto();
  public classificationYesNo: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public reportMasterService: ReportMasterService,
              public notificationService: NotificationService, public mainReportPageComponent: MainReportsPageComponent,
              public privilegeService: PrivilegeService, public detailViewService: DetailViewService, public billsService: BillsService,
              public automationService: AutomationService, public vendorService: VendorService) {
  }


  /**
   * This method can use for get report form controllers
   */
  get f() {
    return this.reportMainForm.controls;
  }

  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName && controlName.value && !controlName.value.replace(/\s/g, '').length) {
      controlName.setValue('');
    }
  }

  ngOnInit() {
    this.reportMainForm = this.formBuilder.group({
      approvedBy: [undefined],
      vendor: [undefined],
      vendorEmail: [undefined],
      referenceNo: [undefined],
      vendorCode: [undefined],
      country: [undefined],
      state: [undefined],
      city: [undefined],
      contactNumber: [undefined],
      billDate: [undefined],
      dueDate: [undefined],
      aging: [undefined],
      billDateRange: [undefined],
      dueDateRange: [undefined],
      createdDate: [undefined],
      createdDateRange: [undefined],
      department: [undefined],
      requester: [undefined],
      customField: [undefined],
      account: [undefined],
      transactionTypes: [undefined],
      approvalGroup: [undefined],
      projectCodeId: [undefined],
      poStatus: [undefined],
      projectCodeIdList: [undefined],
      diverseSupplier: [undefined],
      diversityClassification: [undefined]
    });
    this.getTransactionTableProgressStatus();
    this.getAccountList();
    this.getProjectCodeList();
    this.getDepartment();
    this.getVendorList();
    this.getApprovalGroupList();
    this.getClassificationList(this.classification);
    this.classificationYesNo.data = AppConstant.YES_NO_DROPDOWN;
  }


  getVendorList() {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get classification list for dropdown
   */
  getClassificationList(instance: DropdownDto) {
    this.vendorService.getClassificationList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get approved by list
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.approvalGroupList.data = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  getDepartment() {
    this.billsService.getDepartment().subscribe((res: any) => {
      this.departmentList.data = res.body;
    });
  }


  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectCodeList() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, true).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTaskList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to get account list
   * @param listInstance
   */
  getAccountList() {
    this.billsService.getAccountList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.accountList.data = (res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Date Selected
   * @param value not formatted date
   * @param field to field
   */
  onDateSelect(controller: AbstractControl, value) {
    const dateStr = [];
    dateStr[0] = value[0].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    if (value[1] != null) {
      dateStr[1] = value[1].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } else {
      dateStr[1] = null;
    }
    controller.patchValue(dateStr);
  }

  /**
   * This method use for bill date
   */
  resetBillDate() {
    this.f.billDateRange.reset();
  }

  /**
   * This method use for reset due date
   */
  resetDueDate() {
    this.f.dueDateRange.reset();
  }

  /**
   * This method use for reset created date
   */
  resetCreatedDate() {
    this.f.createdDateRange.reset();
  }


  showReport() {
    this.mainReportPageComponent.btnDisable = true;
    this.mainReportPageComponent.isViewLoading = true;
    const reportFilterDto: ReportFilterDto = this.reportMainForm.value;
    switch (this.reportId) {

      case AppReportType.CASH_REQUIREMENT_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_cash_requirement_detail_report_v2', reportFilterDto);
        break;

      case AppReportType.VENDOR_DETAIL_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_vendor_details_report_v2', reportFilterDto);
        break;

      case AppReportType.USER_OVERVIEW_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_approval_user_summary_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_DETAIL_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_account_payable_details_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_AGING_SUMMARY_BY_VENDOR_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_ap_aging_summary_by_vendor_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_AGING_SUMMARY_BY_USER_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_ap_aging_summary_by_user_report_v2', reportFilterDto);
        break;

      case AppReportType.PO_BY_DEPARTMENT_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_po_by_department_v2', reportFilterDto);
        break;

      case AppReportType.PO_OUTSTANDING_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_outstanding_po_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSE_BY_CUSTOM_FIELD_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_expense_by_custom_field_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSES_BY_ACCOUNT_SUMMARY:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_account_summary_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSES_BY_ACCOUNT_DETAILS:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_expenses_by_account_details_v2', reportFilterDto);
        break;

      case AppReportType.TRANSACTIONS_AWAITING_APPROVAL:
        this.mainReportPageComponent.viewReport('/common_service/sec_awaiting_approval_report_v2', reportFilterDto);
        break;

      case AppReportType.PROJECT_PO_SUMMARY_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_project_po_summary_report_v2', reportFilterDto);
        break;

      case AppReportType.PO_RECEIPT_DETAIL_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_get_po_receipt_detail_report_v2', reportFilterDto);
        break;

      case AppReportType.BILLABLE_TRANSACTIONS:
        this.viewBillableTransaction(this.reportMainForm.value);
        break;

      case AppReportType.AP_BILL_DETAILS_REPORT:
        this.mainReportPageComponent.viewReport('/common_service/sec_account_payable_more_details_report_v2',
          reportFilterDto);
        break;
    }

  }

  /**
   * this method can be used to export selected report
   */
  export() {
    this.mainReportPageComponent.btnDisable = true;
    this.mainReportPageComponent.isExportLoading = true;
    const reportFilterDto: ReportFilterDto = this.reportMainForm.value;
    switch (this.reportId) {
      case AppReportType.CASH_REQUIREMENT_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_cash_requirement_detail_v2', reportFilterDto);
        break;

      case AppReportType.VENDOR_DETAIL_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_vendors_v2', reportFilterDto);
        break;

      case AppReportType.USER_OVERVIEW_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_approval_user_summary_v2', reportFilterDto);
        break;

      case AppReportType.AP_DETAIL_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_account_payable_details_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_AGING_SUMMARY_BY_VENDOR_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_ap_aging_summary_by_vendor_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_AGING_SUMMARY_BY_USER_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_ap_aging_summary_by_user_report_v2', reportFilterDto);
        break;

      case AppReportType.PO_BY_DEPARTMENT_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_po_by_department_v2', reportFilterDto);
        break;

      case AppReportType.PO_OUTSTANDING_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_outstanding_po_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSE_BY_CUSTOM_FIELD_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_expense_by_custom_field_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSES_BY_ACCOUNT_SUMMARY:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_account_summary_v2', reportFilterDto);
        break;

      case AppReportType.EXPENSES_BY_ACCOUNT_DETAILS:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_expenses_by_account_details_v2', reportFilterDto);
        break;

      case AppReportType.TRANSACTIONS_AWAITING_APPROVAL:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_awaiting_approval_report_v2', reportFilterDto);
        break;

      case AppReportType.PROJECT_PO_SUMMARY_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_project_po_summary_report_v2', reportFilterDto);
        break;

      case AppReportType.PO_RECEIPT_DETAIL_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_po_receipt_detail_report_v2', reportFilterDto);
        break;

      case AppReportType.AP_BILL_DETAILS_REPORT:
        this.mainReportPageComponent.exportReport('/common_service/sec_export_account_payable_bill_details_report_v2', reportFilterDto);
        break;
    }
  }

  /**
   * this method can be used to get selected billable transaction list
   * @param value to selected transaction types
   */
  viewBillableTransaction(value) {
    this.selectedTransactionTypes = value.transactionTypes;
    this.reportMasterService.transactionTypes.next(this.selectedTransactionTypes);
    this.reportMasterService.isProgressBill.next(true);
    this.reportMasterService.isProgressExpense.next(true);
    this.reportMasterService.isProgressPO.next(true);
    this.mainReportPageComponent.btnDisable = false;
    this.mainReportPageComponent.isViewLoading = false;
  }

  /**
   * this method used for get updated status of progress feed table data
   */
  getTransactionTableProgressStatus() {
    this.reportMasterService.isProgressPO.subscribe(isProgress => {
      this.isProgressPo = isProgress;
    });
    this.reportMasterService.isProgressBill.subscribe(isProgress => {
      this.isProgressBill = isProgress;
    });
    this.reportMasterService.isProgressExpense.subscribe(isProgress => {
      this.isProgressExpense = isProgress;
    });
  }

  /**
   * this
   */
  isProgressBillableTableData() {
    if (!this.selectedTransactionTypes) {
      return;
    }
    return ((this.isProgressExpense && this.selectedTransactionTypes.includes(this.appConstant.TRANSACTION_TYPE_EXPENSE))
      || (this.isProgressPo && this.selectedTransactionTypes.includes(this.appConstant.TRANSACTION_TYPE_PO))
      || (this.isProgressBill && this.selectedTransactionTypes.includes(this.appConstant.TRANSACTION_TYPE_BILL)));
  }
}
