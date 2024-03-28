import {Component, Input, OnInit} from '@angular/core';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppMainComponent} from "../app.main.component";
import {NotificationDto} from "../../../shared/dto/dashboard/notification-dto";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {UntypedFormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {DashboardService} from "../../../shared/services/dashboard/dashboard.service";
import {HttpClient} from "@angular/common/http";
import {NotificationEventEmitterService} from "../../../shared/services/common/notification-event-emitter/notification-event-emitter.service";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {ApiEndPoint} from '../../../shared/utility/api-end-point';
import {AppConstant} from "../../../shared/utility/app-constant";

@Component({
  selector: '[app-notification]',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  @Input() isPortal
  @Input() subAccountId

  disabled = false;
  compact = false;
  invertX = false;
  invertY = false;

  public notifications: NotificationDto[] = [];
  public appEnumConstants = AppEnumConstants;
  public noOfNotifications = 0;
  public showClearDialog = false;

  constructor(public formBuilder: UntypedFormBuilder, public app: AppMainComponent, public router: Router, public notificationService: NotificationService,
              public dashboardService: DashboardService, public httpClient: HttpClient, public privilegeService: PrivilegeService,
              public notificationEventEmitter: NotificationEventEmitterService, public detailViewService: DetailViewService) {
  }

  ngOnInit(): void {
    // SUBSCRIBE NOTIFICATION EVENT EMITTER //
    this.notificationEventEmitter.notificationsSubscription =
      this.notificationEventEmitter.invokeLoadNotifications.subscribe((notifications: any) => {
        if (this.noOfNotifications < notifications.notifications){
          this.setNotificationsToNotificationPanel();
        }
      });
    this.setNotificationsToNotificationPanel();
  }

  setNotificationsToNotificationPanel(){
    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
    let clientId = localStorage.getItem(AppConstant.SUB_CLIENT_ID);

    if (this.privilegeService.isPortal() && !clientId){
      return;
    }
    if (this.privilegeService.isSupport()){
      return;
    }
    if (!clientId){
      clientId = user.tenantId;
    }
    this.dashboardService.getUserNotificationList(clientId, user.username).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notifications = res.body.notifications[0];
          this.noOfNotifications = res.body.notificationCount;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        },
        (error) => {
          this.notificationService.errorMessage(error);
        }
      );
  }

  /**
   * Mark as read Notification
   */
  markAsReadNotification(tenantId, notificationId, status) {
    this.dashboardService.markAsReadNotifications(tenantId, notificationId).subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        const index = this.notifications.findIndex(x => x.id === notificationId);

        if (status === AppEnumConstants.NOTIFICATION_STATUS_UNREAD) {
          this.noOfNotifications = this.noOfNotifications - 1;
        }

        if (this.noOfNotifications === 0) {
          this.app.hideOverlayMenu();
          this.app.notificationMenuClick = false;
          this.app.topbarNotificationMenuActive = false;
        }
      }
    });
  }

  /**
   * Remove item in Notification
   */
  removeNotification(tenantId, notificationId, status) {
    this.dashboardService.deleteNotifications(tenantId, notificationId).subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        const index = this.notifications.findIndex(x => x.id === notificationId);

        this.notifications.splice(index, 1);

        if (status === AppEnumConstants.NOTIFICATION_STATUS_UNREAD) {
          this.noOfNotifications = this.noOfNotifications - 1;
        }

        if (this.noOfNotifications === 0) {
          this.app.hideOverlayMenu();
          this.app.notificationMenuClick = false;
          this.app.topbarNotificationMenuActive = false;
        }
      }
    });
  }

  /**
   * Get Notification Id according to type
   * @param type ID
   */
  getNotificationIcon(type) {
    switch (type) {
      case AppEnumConstants.NOTIFICATION_TYPE_BILL: {
        return AppIcons.BILL_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO: {
        return AppIcons.PURCHASE_ORDER_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO_RECEIPT: {
        return AppIcons.PURCHASE_ORDER_RECEIPT_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_EXPENSE: {
        return AppIcons.EXPENSE_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PAYMENT: {
        return AppIcons.PAYMENT_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_VENDOR: {
        return AppIcons.VENDOR_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_AUTOMATION: {
        return AppIcons.AUTOMATION_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_NOTE: {
        return AppIcons.ICON_DETAIL_VIEW;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD: {
        return AppIcons.CREDIT_CARD_ICON;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD_RECEIPT: {
        return AppIcons.RECEIPT_ICON;
      }
    }
  }

  /**
   * Get Notification Id according to type
   * @param type ID
   */
  getNotificationColors(type) {
    switch (type) {
      case AppEnumConstants.NOTIFICATION_TYPE_BILL: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_BILL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_PO;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO_RECEIPT: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_PO_RECEIPT;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_EXPENSE: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_EXPENSE;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PAYMENT: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_PAYMENT;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_VENDOR: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_VENDOR;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_AUTOMATION: {
        return AppEnumConstants.NOTIFICATION_CATEGORY_AUTOMATION;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_NOTE: {
        return AppEnumConstants.NOTIFICATION_CREDIT_NOTE;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD: {
        return AppEnumConstants.NOTIFICATION_CREDIT_CARD;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD_RECEIPT: {
        return AppEnumConstants.NOTIFICATION_CREDIT_CARD_RECEIPT;
      }
    }
  }

  /**
   * Get Notification status
   * @param status
   */
  getNotificationStatus(status) {
    switch (status) {
      case AppEnumConstants.NOTIFICATION_STATUS_READ: {
        return AppEnumConstants.NOTIFICATION_STATUS_READ_CLASS;
      }
      case AppEnumConstants.NOTIFICATION_STATUS_UNREAD: {
        return AppEnumConstants.NOTIFICATION_STATUS_UNREAD_CLASS;
      }
    }
  }


  /**
   * Item inside Notification Clicked
   */
  itemClickedNotification(item) {
    this.markAsReadNotification(item.tenantId, item.id, item.status);
    if (item.status === AppEnumConstants.NOTIFICATION_STATUS_UNREAD) {
      item.status = AppEnumConstants.NOTIFICATION_STATUS_READ
    }

    if (!item.clickable) {
      return
    }

    setTimeout(() => {
      this.app.hideOverlayMenu();
      this.app.notificationMenuClick = false;
      this.app.topbarNotificationMenuActive = false;
    }, 1000);

    if (item.notificationTypeId === AppEnumConstants.NOTIFICATION_TYPE_CREDIT_NOTE &&
      item.referenceStatus != AppEnumConstants.STATUS_DELETED) {
      this.detailViewService.openCreditNoteDetailView(item.referenceId);
      return;
    }
    if (item.notificationTypeId === AppEnumConstants.NOTIFICATION_TYPE_CREDIT_NOTE &&
      item.referenceStatus === AppEnumConstants.STATUS_DELETED) {
      this.notificationService.infoMessage(HttpResponseMessage.CREDIT_NOTE_DELETED_ALREADY);
      return;
    }

    if (this.privilegeService.isVendor()) {
      this.router.navigate([this.getVendorRoutingPath(item.notificationTypeId), {
        id: item.referenceId,
        status: item.referenceStatus,
        tenantId: item.tenantId
      }]);
    } else {
      this.router.navigate([this.getRoutingPath(item.notificationTypeId), {
        id: item.referenceId,
        status: item.referenceStatus,
        type: item.notificationTypeId
      }]);
    }
  }

  /**
   * Get Vendor Routing Path According to Notification Type
   */
  getVendorRoutingPath(type) {
    switch (type) {
      case AppEnumConstants.NOTIFICATION_TYPE_BILL: {
        return AppEnumConstants.VENDOR_INVOICE_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO: {
        return AppEnumConstants.VENDOR_PURCHASE_ORDER_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_VENDOR: {
        return AppEnumConstants.VENDOR_CUSTOMER_URL;
      }
    }
  }


  /**
   * Get Tenant Routing Path According to Notification Type
   */
  getRoutingPath(type) {
    switch (type) {
      case AppEnumConstants.NOTIFICATION_TYPE_BILL: {
        return AppEnumConstants.BILL_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO: {
        return AppEnumConstants.PURCHASE_ORDER_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PO_RECEIPT: {
        return AppEnumConstants.PURCHASE_ORDER_RECEIPT_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_EXPENSE: {
        return AppEnumConstants.EXPENSE_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD: {
        return AppEnumConstants.EXPENSE_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_PAYMENT: {
        return AppEnumConstants.PAYMENT_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_VENDOR: {
        return AppEnumConstants.VENDOR_URL;
      }
      case AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD_RECEIPT: {
        return AppEnumConstants.EXPENSE_URL;
      }
    }
  }

  /**
   * Notification Icon Clicked
   */
  notificationClicked() {
    this.app.notificationMenuClick = true;
    this.app.topbarNotificationMenuActive = true;
  }

  /**
   * Clear all Notifications
   */
  clearAllNotifications() {
    const tenantId = this.notifications[0].tenantId;
    this.dashboardService.clearAllNotifications(tenantId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.showClearDialog = false;
          this.notifications = [];
          this.noOfNotifications = 0;
          this.app.notificationMenuClick = false;
          this.app.topbarNotificationMenuActive = false;
        }
      }
    );
  }

  getNotificationReference(items: NotificationDto) {
    if (items.notificationTypeId === AppEnumConstants.NOTIFICATION_TYPE_AUTOMATION) {
      return null;
    }
    if (items.notificationTypeId === AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD) {
      if (items.status === AppEnumConstants.STATUS_REJECT || items.status === AppEnumConstants.STATUS_APPROVED) {
        return null;
      }
      return items.referenceNo;
    }

    if (items.referenceNo) {
      return '#' + items.referenceNo;
    }
    return null;
  }
}
