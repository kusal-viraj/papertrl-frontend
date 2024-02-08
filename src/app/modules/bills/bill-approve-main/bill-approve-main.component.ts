import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BillApproveDto} from '../../../shared/dto/bill/bill-approve-dto';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {DomSanitizer} from '@angular/platform-browser';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from 'src/app/shared/enums/app-authorities';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';

@Component({
  selector: 'app-bill-approve-main',
  templateUrl: './bill-approve-main.component.html',
  styleUrls: ['./bill-approve-main.component.scss']
})
export class BillApproveMainComponent implements OnInit, OnDestroy {
  public smallHorSplitter = false;
  public extraSmallHorSplitter = true;
  public needToRefresh = true;
  public isResponseDataReceived: boolean;
  public billDetails: BillMasterDto;

  public billNo: any;
  public billApproveDto: BillApproveDto;
  public additionalData: AdditionalFieldDetailDto [];
  public adHocWorkflowDetails: any [] = [];
  public billAttachmentId: any;

  public billIndex;
  public billIdList: number[] = []; // get all approvable Bill id list
  public matchingTableValues: any [];
  public screenSize: any;
  public responsiveSize;
  public originalFileName: string;
  public billUrl: any;
  public poUrl: any;
  public poReceiptUrl: any;
  public isPoAttachmentShown = false;
  public poId: any;
  public isViewMatchingTable: any;
  public reSubmit = false;
  public eBillEdit = false;
  public isFromDetailViewEdit = false;

  /* This property get for check bill status through enum */
  public enums = AppEnumConstants;


  @Input() approveBillView = false;
  @Input() hasUserInApprovalGroupOrAssignee = false;
  @Input() billId;
  @Input() billIdFromList;
  @Input() billNoFromList: any;
  @Input() approveView = false;
  @Input() fromDashboard = false;
  @Input() singleBill = false;
  @Input() tableSearch: TableSearchFilterDataDto;
  @Input() isDetailView = false;
  @Input() fromApprovedBillScreen = false;
  @Input() billType: any;
  @Input() billStatus: any;
  @Output() closeBillApprove = new EventEmitter<boolean>();
  @Output() closeBillDetailView = new EventEmitter<boolean>();
  @Output() openBillApprove = new EventEmitter<boolean>();
  @Output() isCloseApproveView = new EventEmitter<boolean>();
  public appConstant = new AppConstant();
  public appAuthorities = AppAuthorities;
  public isClickApproveAction = false;
  updatedBill: any;


  constructor(public billApproveService: BillApprovalsService, public notificationService: NotificationService, public billSubmitService: BillSubmitService,
              public config: DynamicDialogConfig, public detailViewService: DetailViewService, public formGuardService: FormGuardService,
              public sanitizer: DomSanitizer, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService, public billService: BillsService, public billsService: BillsService) {
  }

  ngOnDestroy(): void {
    this.detailViewService.closeBillDetailView();
  }

  ngOnInit(): void {
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    if (this.config?.data) {
      this.billId = this.config.data.id;
      this.approveView = true;
      this.isDetailView = true;
      this.singleBill = true;
    }
    if (!this.fromApprovedBillScreen) {
      this.getPendingBillIdList();
    } else {
      this.getBillDetails(this.billId);
    }
  }

  /**
   * This method use for generate Bill receipt url
   * @param isDownload boolean
   * * @param id to id
   */
  generateBillUrl(isDownload: boolean, id) {
    if (id === undefined || id === null) {
      return;
    } else {
      this.billSubmitService.getBillAttachment(id).subscribe(res => {
        const url = window.URL.createObjectURL(res.data);
        if (isDownload) {
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.originalFileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.getSafeUrl(url, 'bill');
        }
      }, error => {
        this.notificationService.errorMessage({
          severity: AppMessageService.SUMMARY_ERROR,
          summary: AppMessageService.SUMMARY_ERROR,
          detail: error.message
        });
      });
    }
  }

  /**
   * This method use for generate po receipt attachment url
   * @param isDownload boolean
   * * @param id to id
   */
  generatePoUrl(isDownload: boolean, id) {
    this.billSubmitService.getPoAttachment(id).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      if (isDownload) {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'name');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.getSafeUrl(url, 'po');
      }
    }, error => {
      this.notificationService.errorMessage({
        severity: AppMessageService.SUMMARY_ERROR,
        summary: AppMessageService.SUMMARY_ERROR,
        detail: error.message
      });
    });
  }

  /**
   * Security Bypass for PDF Url
   */
  getSafeUrl(url, file) {
    switch (file) {
      case 'po': {
        this.poUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        break;
      }
      case 'bill': {
        this.billUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        break;
      }
    }
  }

  getPendingBillIdList() {
    if (this.singleBill) {
      this.getBillDetails(this.billId);
      return;
    }
    this.billApproveService.getApprvableBillIdList(this.tableSearch, !this.isDetailView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billIdList = res.body;
        if (this.billIdList.length === 0) {
          this.close();
          this.closeBillApprove.emit();
        } else {
          if (this.billIdList.includes(this.billId)) {
            this.needToRefresh = true;
            this.billIndex = this.billIdList.findIndex(x => x === this.billId);
            this.getBillDetails(this.billIdList[this.billIndex]);
          } else {
            this.needToRefresh = true;
            this.getBillDetails(this.billIdList[0]);
          }
          // this.billIndex = this.billIdList.findIndex(x => x === this.billId);
        }
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }

  /**
   * Get next Bill Details
   */
  billNext() {
    this.billDetails = null;
    this.billId = null;
    this.billIndex++;
    const currentbillId = this.billIdList[this.billIndex];
    this.billId = currentbillId;
    if (currentbillId !== undefined) {
      this.getBillDetails(currentbillId);
    }
  }

  /**
   * Get previous Bill Details
   */
  billPrev() {
    this.billDetails = null;
    this.billId = null;
    this.billIndex--;
    const currentbillId = this.billIdList[this.billIndex];
    this.billId = currentbillId;
    if (currentbillId !== undefined) {
      this.getBillDetails(currentbillId);
    }
  }

  /**
   * Next Button Enable
   */
  isNextBill() {
    if (this.singleBill) {
      return true;
    }
    if (this.billIdList === null || this.billIdList === undefined || this.billIdList.length === 0) {
      return false;
    }
    return (this.billIdList.length === (this.billIndex + 1));
  }

  /**
   * Previous Button Enable
   */
  isPrevBill() {
    if (this.singleBill) {
      return true;
    }
    if (this.billIdList === null || this.billIdList === undefined || this.billIdList.length === 0) {
      return false;
    }
    return (this.billIdList.indexOf(Number(this.billIdList[(this.billIndex)]))) === 0;
  }

  /**
   * Close Bill Drawer
   */
  close() {
    if (this.config?.data) {
      this.detailViewService.closeBillDetailView();
      return;
    }
    this.closeBillDetailView.emit(true);
  }

  /**
   *  This method close Bill approve view come from detail view
   */
  closeApproveViewFromDetailView() {
    this.closeBillDetailView.emit(true);
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    // tslint:disable-next-line:radix
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
   * this method can be used to get bill details
   */
  getBillDetails(billId) {
    this.billApproveService.getBillDetail(billId, false).subscribe(async (res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
        this.billDetails = res.body;
        this.hasUserInApprovalGroupOrAssignee = await this.isValidApproveAccess(res.body);
        this.updatedBill = this.billDetails;
        this.isResponseDataReceived = true;
        this.additionalData = res.body.additionalData;
        this.billId = res.body.id;
        this.billNo = res.body.billNo;
        this.poId = res.body.poId;
        this.needToRefresh = false;
        this.getPoId(this.poId);
        this.generateBillUrl(false, res.body.billAttachmentId);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

    if (this.isFromDetailViewEdit) {
      this.isDetailView = true;
      this.isClickApproveAction = false;
    }
  }

  /**
   * this method will trigger when remove the additional attachment
   */
  refreshAttachmentVIew() {
    if (!this.billDetails.billAttachmentId) {
      return;
    } else {
      this.generateBillUrl(false, this.billDetails.billAttachmentId);
    }
  }

  /**
   * This method can be used to get po id from form
   * @param event to value
   */
  getPoId(event) {
    this.poId = event;
    if (!this.poId) {
      this.isPoAttachmentShown = false;
      return;
    } else {
      this.isPoAttachmentShown = true;
      this.generatePoUrl(false, this.poId);
    }
  }

  /**
   * This method can be used to delete bill
   */
  deleteBill() {
    this.confirmationService.confirm({
      key: 'billDeleteFromDetailView',
      message: 'You want to delete this Bill',
      accept: () => {
        this.billService.deleteBill(this.billId, false).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.BILL_DELETED_SUCCESSFULLY);
            this.eBillEdit = false;
            this.reSubmit = false;
            this.approveView = false;
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
   * This method can be used to edit bill
   */
  editBill() {
    this.eBillEdit = false;
    this.reSubmit = false;
    this.billsService.canEdit(this.billId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.approveView = false;
        this.isDetailView = false;
        if (this.billType === 'E' || this.billType === 'R' || this.billType === 'C') {
          this.eBillEdit = true;
          this.reSubmit = false;
        } else {
          this.eBillEdit = false;
          this.reSubmit = true;
        }
        this.notificationService.clear();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to check privileges for bill approve
   */
  checkPrivilegesForBillApprove() {
    const hasRequiredPrivilege = this.privilegeService.isAuthorizedMultiple(
      [this.appAuthorities.BILL_APPROVE, this.appAuthorities.BILL_REJECT,
        this.appAuthorities.BILL_OVERRIDE_APPROVAL]);

    const isBillPending = (this.updatedBill?.status === this.enums.STATUS_PENDING);


    return (hasRequiredPrivilege && this.isDetailView && isBillPending && this.hasUserInApprovalGroupOrAssignee);

  }

  /**
   * This method can be used to approve bill
   */

  approveBill() {
    this.getPendingBIllList(true);
    this.isClickApproveAction = true;
    this.getBillDetails(this.billId);
    this.openBillApprove.emit();
  }

  /**
   * This method can be used to get pending bill list
   */
  getPendingBIllList(pendingOnly) {
    if (!this.tableSearch) {
      return;
    }
    this.billApproveService.getApprvableBillIdList(this.tableSearch, pendingOnly).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billIdList = res.body;
      }
    });
  }


  /**
   * Is User Authorized to approve
   */
  async isValidApproveAccess(billObj) {
    return new Promise<boolean>((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

      if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OVERRIDE_APPROVAL)) {
        resolve(true);
      } else {
        const isGroupExist = this.isApprovalGroupExist(user.approvalGroups, billObj);
        const isUserExist = this.isApprovalGroupUserExist(user.username, billObj);

        if (isGroupExist || isUserExist) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  }


  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, billObj) {
    if (!billObj?.approvalGroupInt) {
      return false;
    }

    return approvalGroup.includes(billObj?.approvalGroupInt);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, billObj) {
    if (!billObj?.approvalUserStr) {
      return false;
    }

    return approvalUser === billObj?.approvalUserStr;
  }

}
