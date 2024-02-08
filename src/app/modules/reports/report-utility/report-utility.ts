import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {ReportMasterService} from '../../../shared/services/reports/report-master.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {OverlayPanel} from "primeng/overlaypanel";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {BillBillableTransactionDto} from "../../../shared/dto/report/bill-billable-transaction-dto";
import {ExpenseBillableTransactionDto} from "../../../shared/dto/report/expense-billable-transaction-dto";
import {PoBillableTransactionDto} from "../../../shared/dto/report/po-billable-transaction-dto";
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PurchaseOrdersService} from '../../../shared/services/vendor-community/purchase-orders.service';
import {AutomationService} from "../../../shared/services/automation-service/automation.service";

export class ReportUtility {

  public approvedByList: DropdownDto = new DropdownDto();
  public countryList: DropdownDto = new DropdownDto();
  public cityList: DropdownDto = new DropdownDto();
  public agingList: DropdownDto = new DropdownDto();
  public customFieldList: DropdownDto = new DropdownDto();
  public transActionType: DropdownDto = new DropdownDto();
  public statusList: DropdownDto = new DropdownDto();
  public billBillableList: BillBillableTransactionDto [] = [];
  public expenseBillableDetails: ExpenseBillableTransactionDto [] = [];
  public poBillableList: PoBillableTransactionDto [] = [];


  public overlayId: any;
  public poId: number;
  public productId: number;
  public accountId: number;
  public isViewPO = false;
  public isViewItem = false;
  public isViewAccount = false;
  public isViewBill = false;
  public billId: any;
  public poNumber: string;
  public innerHeightOfPOBillableTransactionTable: number = 130;
  public innerHeightOfBillBillableTransactionTable: number = 130;
  public innerHeightOfExpenseBillableTransactionTable: number = 170;

  constructor(public reportMasterDataService: ReportMasterService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public detailViewService: DetailViewService, public billsService: BillsService,
              public automationService: AutomationService) {
    this.getApprovedByList(this.approvedByList);
    this.getCountriesList(this.countryList);
    this.getCitiesList(this.cityList);
    this.getAgingList(this.agingList);
    this.getCustomFieldList(this.customFieldList);
    this.getTransActionTypeList(this.transActionType);
    this.getStatusList(this.statusList);
    setTimeout(() => {
      this.setTableHeight();
    }, 1000);
  }

  /**
   * this method can be used to get approved by list
   * @param listInstance to dropdown list instance
   */
  getApprovedByList(listInstance: DropdownDto) {
    this.automationService.getApprovalUserList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get country list
   * @param listInstance to dropdown list instance
   */
  getCitiesList(listInstance: DropdownDto) {
    this.reportMasterDataService.getCitiesList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get country list
   * @param listInstance to dropdown list instance
   */
  getCountriesList(listInstance: DropdownDto) {
    this.reportMasterDataService.getCountriesList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor list
   * @param listInstance to dropdown list instance
   */
  getAgingList(listInstance: DropdownDto) {
    this.reportMasterDataService.getAgingList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = (res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to get custom field list
   * @param listInstance
   */
  getCustomFieldList(listInstance: DropdownDto) {
    this.reportMasterDataService.getCustomFieldList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = (res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get trans action type
   * @param transActionType to trans action type
   */
  getTransActionTypeList(transActionType: DropdownDto) {
    this.reportMasterDataService.getTransActionTypeList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        transActionType.data = (res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get status list
   * @param statusList to statusList
   */
  getStatusList(statusList: DropdownDto) {
    this.reportMasterDataService.getStatusList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        statusList.data = (res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * function used to open overlay panel of data table item (po / bill)
   * @param id to selected id (of po/bill/item/account)
   * @param event to toggle event
   * @param overlay to overlay reference
   * @param isAvailablePrivilege to action privilege
   */
  async viewOverlayPanel(id, event, overlay, isAvailablePrivilege: boolean) {
    if (isAvailablePrivilege && id) {
      await (this.overlayId = id);
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  /**
   * this function used to hide overlay panel
   * @param overlay to overlay reference
   */
  hideOverlay(overlay: OverlayPanel) {
    if (overlay.overlayVisible) {
      overlay.hide();
    }
  }


  /**
   * function used for select hover item style
   * @param field to hover field
   */
  selectClass(field) {
    switch (field) {
      case 'poId':
        return this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
      case 'billId':
        return this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
      case 'productId':
        return this.privilegeService.isAuthorized(AppAuthorities.ITEMS_DETAIL_VIEW);
      case 'accountId':
        return this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DETAIL_VIEW);

    }
  }

  /**
   * function trigger when click on po record
   * @param rowValue to row object
   * @param field to clicked module
   */
  clickTableData(rowValue, field) {
    switch (field) {
      case 'poId':
        this.poId = rowValue.poId;
        this.poNumber = rowValue.poNumber;
        if (!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
          return;
        } else {
          this.isViewPO = true;
          this.isViewItem = false;
          this.isViewAccount = false;
          this.isViewBill = false;
        }
        break;

      case 'productId':
        this.productId = rowValue.productId;
        if (!this.privilegeService.isAuthorized(AppAuthorities.ITEMS_DETAIL_VIEW)) {
          return;
        } else {
          this.isViewItem = true;
          this.isViewPO = false;
          this.isViewAccount = false;
          this.isViewBill = false;
        }
        break;

      case 'accountId':
        this.accountId = rowValue.accountId;
        if (!this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DETAIL_VIEW)) {
          return;
        } else {
          this.isViewAccount = true;
          this.isViewItem = false;
          this.isViewPO = false;
          this.isViewBill = false;
        }
        break;

      case 'billId':
        this.billId = rowValue.billId;
        if (!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
          return;
        } else {
          this.isViewAccount = false;
          this.isViewItem = false;
          this.isViewPO = false;
          this.isViewBill = true;
          this.detailViewService.openBillDetailView(this.billId);
        }
        break;
    }
  }

  /**
   * this method set to the po billable transaction table height
   */
  setTableHeight() {
    let isVisiblePoTable: boolean;
    let isVisibleBillTable: boolean;
    let isVisibleExpenseTable: boolean;
    let visibleContents: any [] = [];
    let length = 0;

    this.reportMasterDataService.poBillableTransActionListLength.subscribe(tableLength => {
      isVisiblePoTable = tableLength > AppConstant.ZERO;
      visibleContents.push(isVisiblePoTable);
    });

    this.reportMasterDataService.billBillableTransActionListLength.subscribe(tableLength => {
      isVisibleBillTable = tableLength > AppConstant.ZERO;
      visibleContents.push(isVisibleBillTable);
    });

    this.reportMasterDataService.expenseBillableTransActionListLength.subscribe(tableLength => {
      isVisibleExpenseTable = tableLength > AppConstant.ZERO;
      visibleContents.push(isVisibleExpenseTable);
    });

    length = visibleContents.filter(x => x === true).length;
    this.assignHeight(length);
  }

  /**
   * this method assign height to tables
   * @param length to data available table count
   */
  assignHeight(length){
    switch (length) {
      case 1:
        this.innerHeightOfPOBillableTransactionTable = 621;
        this.innerHeightOfBillBillableTransactionTable = 621;
        this.innerHeightOfExpenseBillableTransactionTable = 660;
        break;

      case 2:
        this.innerHeightOfPOBillableTransactionTable = 261;
        this.innerHeightOfBillBillableTransactionTable = 261;
        this.innerHeightOfExpenseBillableTransactionTable = 300;
        break;

      case 3:
        this.innerHeightOfPOBillableTransactionTable = 131;
        this.innerHeightOfBillBillableTransactionTable = 131;
        this.innerHeightOfExpenseBillableTransactionTable = 170;
        break;
    }
  }
}
