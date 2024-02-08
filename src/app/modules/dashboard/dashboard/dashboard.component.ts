import {Component, HostListener, OnInit} from '@angular/core';
import {BreadcrumbService} from '../../../shared/services/breadcrumb.service';
import {TaskListDto} from '../../../shared/dto/dashboard/task-list-dto';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {Router} from '@angular/router';
import {InfoCardsDto} from '../../../shared/dto/dashboard/info-cards-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonSystemTaskRoutingService} from '../../../shared/services/common/common-system-task-routing/common-system-task-routing.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {ApiEndPoint} from '../../../shared/utility/api-end-point';
import {AppIcons} from "../../../shared/enums/app-icons";


export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
  icon?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public taskList: TaskListDto[] = [];
  public infoCards: InfoCardsDto = new InfoCardsDto();
  public showToDo = false;
  public noOfTasksOnPage;
  public barData: any;
  public lineData: any;
  public appAuthorities = AppAuthorities;
  public appIcons = AppIcons;


  constructor(private breadcrumbService: BreadcrumbService, public router: Router, public privilegeService: PrivilegeService,
              public dashboardService: DashboardService, public notificationService: NotificationService,
              public commonSystemTaskRoutingService: CommonSystemTaskRoutingService) {
    this.breadcrumbService.setItems([
      {label: 'Dashboard', routerLink: ['/']}
    ]);

    if (this.privilegeService.isPortal() && !localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      this.router.navigateByUrl('home/portal-dashboard')
      return;
    }
  }

  ngOnInit() {
    this.getSystemTask();
    this.getInfoCardData();
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (innerWidth <= 540) {
      this.noOfTasksOnPage = 1;
    } else if (window.innerWidth <= 700) {
      this.noOfTasksOnPage = 2;
    } else if (window.innerWidth <= 991) {
      this.noOfTasksOnPage = 3;
    } else {
      this.noOfTasksOnPage = 4;
    }
  }

  /**
   * this method can be used to mark as done
   * @param id to id
   */

  markAsDone(id) {
    this.dashboardService.markAsDone(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const index = this.taskList.findIndex(x => x.id === id);
        this.taskList.splice(index, 1);
        this.getSystemTask();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

    if (this.taskList.length === 0) {
      this.showToDo = false;
    }
  }

  /**
   * this method can be used to get all pending all task
   */
  getSystemTask() {
    this.dashboardService.getToDoList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.taskList = res.body;
        if (this.taskList.length > 0) {
          this.showToDo = true;
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get all pending all task
   */
  getInfoCardData() {
    this.dashboardService.getLineChartData().subscribe(res => {
      this.lineData = res.body;
    });

    this.dashboardService.getBarData().subscribe(res => {
      this.barData = res.body;
    });

    this.dashboardService.getCardList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.infoCards = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method navigate url
   */
  navigateToSpecificUrl(url, title) {
    this.commonSystemTaskRoutingService.commonRouting.next(title);
    this.router.navigateByUrl(url);
  }

  isBillModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_EDIT, AppAuthorities.BILL_APPROVE,
      AppAuthorities.BILL_REJECT, AppAuthorities.BILL_QUICK_APPROVE, AppAuthorities.BILL_SKIP_APPROVAL,
      AppAuthorities.BILL_DETAIL_VIEW, AppAuthorities.BILL_VIEW_AUDIT_TRAIL, AppAuthorities.BILL_DOWNLOAD_BILL,
      AppAuthorities.BILL_APPLY_PAYMENT, AppAuthorities.BILL_VIEW_PAYMENTS, AppAuthorities.BILL_DELETE,
      AppAuthorities.BILL_CSV_EXPORT, AppAuthorities.BILL_CHANGE_ASSIGNEE, AppAuthorities.BILL_UNDO_ACTION,
      AppAuthorities.BILL_CREATE, AppAuthorities.BILL_PROCESS, AppAuthorities.BILL_OVERRIDE_APPROVAL]);
  }

  isVendorModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDORS_EDIT, AppAuthorities.VENDORS_MANAGE_VENDOR_REQUEST,
      AppAuthorities.VENDORS_UPLOAD, AppAuthorities.VENDORS_SEND_VENDOR_INVITATION, AppAuthorities.VENDORS_CREATE,
      AppAuthorities.VENDORS_DETAIL_VIEW, AppAuthorities.VENDORS_CSV_EXPORT]);
  }

  isPoModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_CREATE,
      AppAuthorities.PURCHASE_ORDER_EDIT, AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW, AppAuthorities.PURCHASE_ORDER_DELETE,
      AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT, AppAuthorities.PURCHASE_ORDER_VIEW_AUDIT_TRAIL,
      AppAuthorities.PURCHASE_ORDER_CSV_EXPORT, AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT, AppAuthorities.PURCHASE_ORDER_QUICK_APPROVE,
      AppAuthorities.PURCHASE_ORDER_CHANGE_ASSIGNEE, AppAuthorities.PURCHASE_ORDER_UNDO_ACTION,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL, AppAuthorities.PURCHASE_ORDER_SAVE_AS_APPROVED]);
  }

  isExpenseModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.EXPENSES_EDIT,
      AppAuthorities.EXPENSES_DELETE, AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
      AppAuthorities.EXPENSES_VIEW_AUDIT_TRAIL, AppAuthorities.EXPENSES_DOWNLOAD_REPORT, AppAuthorities.EXPENSES_VIEW_REPORT,
      AppAuthorities.EXPENSES_CSV_EXPORT, AppAuthorities.EXPENSES_QUICK_APPROVE, AppAuthorities.EXPENSES_CHANGE_ASSIGNEE,
      AppAuthorities.EXPENSES_UNDO_ACTION, AppAuthorities.EXPENSES_OVERRIDE_APPROVAL, AppAuthorities.EXPENSES_CREATE,
      AppAuthorities.EXPENSE_SAVE_AS_APPROVED]);
  }
}
