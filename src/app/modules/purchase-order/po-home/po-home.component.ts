import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AutomationWorkflowConfigComponent} from "../../automation/automation-workflow-config/automation-workflow-config.component";
import {PoReceiptListComponent} from "../po-receipt-list/po-receipt-list.component";

export class PoState {
  public tabIndex?: any;
}

@Component({
  selector: 'app-po-home',
  templateUrl: './po-home.component.html',
  styleUrls: ['./po-home.component.scss']
})

export class PoHomeComponent implements OnInit, OnDestroy {

  public poState: PoState = new PoState();
  public tabIndex = 0;
  public appAuthorities = AppAuthorities;
  public showPoApproveDetailViewDrawer = false;
  public poDetailView = false;
  public poId;

  @ViewChild('poReceiptListComponent')
  public poReceiptListComponent: PoReceiptListComponent;

  constructor(public route: ActivatedRoute, public privilegeService: PrivilegeService,
              public router: Router, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('poStateObj')) {
      this.poState = JSON.parse(sessionStorage.getItem('poStateObj'));
      this.tabIndex = this.poState.tabIndex;
    } else {
      this.tabIndex = 0;
    }
    this.route.params.subscribe(params => {
      if (params.tab !== undefined) {
        this.tabChanged(parseInt(params.tab));
      }

      if (params.id && params.status) {
        this.openScreens(params)
      }
    });
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.poId = parseInt(params.id);
      this.showPoApproveDetailViewDrawer = true;
      this.poDetailView = false;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.showPoApproveDetailViewDrawer = false;
      this.poDetailView = false;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.PURCHASE_ORDER_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.PO_DELETED_ALREADY)
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      this.poId = parseInt(params.id);
      this.showPoApproveDetailViewDrawer = false;
      this.poDetailView = true;
      return;
    }
  }

  /**
   * This method can be used store data in storage
   */
  storeSessionStore() {
    this.poState.tabIndex = this.tabIndex;
    sessionStorage.setItem('poStateObj', JSON.stringify(this.poState));
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('poStateObj');
  }

  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
    this.storeSessionStore();
  }

  isPoModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_CREATE,AppAuthorities.PO_GENERATE_PO_RECEIPT,
      AppAuthorities.PURCHASE_ORDER_EDIT, AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW, AppAuthorities.PURCHASE_ORDER_DELETE,
      AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT, AppAuthorities.PURCHASE_ORDER_VIEW_AUDIT_TRAIL,
      AppAuthorities.PURCHASE_ORDER_CSV_EXPORT, AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT, AppAuthorities.PURCHASE_ORDER_QUICK_APPROVE,
      AppAuthorities.PURCHASE_ORDER_CHANGE_ASSIGNEE, AppAuthorities.PURCHASE_ORDER_UNDO_ACTION, AppAuthorities.PO_RE_OPEN,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL, AppAuthorities.PURCHASE_ORDER_SAVE_AS_APPROVED, AppAuthorities.PURCHASE_ORDER_BILL_CREATE]);
  }

  isPoReceiptModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PO_RECEIPT_CREATE,
      AppAuthorities.PO_RECEIPT_EDIT, AppAuthorities.PO_RECEIPT_DETAIL_VIEW, AppAuthorities.PO_RECEIPT_DELETE,
      AppAuthorities.PO_RECEIPT_ATTACH_TO_A_BILL, AppAuthorities.PO_RECEIPT_CLOSE_PO_RECEIPT, AppAuthorities.PO_RECEIPT_CSV_EXPORT,
      AppAuthorities.PO_RECEIPT_DOWNLOAD_REPORT, AppAuthorities.PO_RECEIPT_RE_OPEN_PO_RECEIPT, AppAuthorities.PO_RECEIPT_CREATE_BILL]);
  }

  detailViewClosed() {
    this.router.navigate([AppEnumConstants.PURCHASE_ORDER_URL]); // navigate to same route
  }

  /**
   * this method can be used to update po receipt search data
   */
  updatePOReceiptSearchTable() {
    if (this.poReceiptListComponent) {
      this.poReceiptListComponent.loadData(this.poReceiptListComponent.tableSupportBase.searchFilterDto);
    }
  }
}
