import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MenuItem, MessageService} from 'primeng/api';
import {AppMainComponent} from '../app.main.component';
import {Breadcrumb, BreadcrumbService} from 'angular-crumbs';
import {NavigationEnd, Router} from '@angular/router';
import {UntypedFormBuilder} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {UserService} from '../../../shared/services/user/user.service';
import {LoginLogoutService} from '../../../shared/services/auth/login-logout.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationDto} from '../../../shared/dto/dashboard/notification-dto';
import {EventEmitterService} from '../../../shared/services/common/event-emitter/event-emitter.service';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {TenantService} from '../../../shared/services/support/tenant.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ApiEndPoint} from '../../../shared/utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {WebSocketApiService} from '../../../shared/services/notification-subcription/web-socket-api.service';
import {
  NotificationEventEmitterService
} from '../../../shared/services/common/notification-event-emitter/notification-event-emitter.service';
import {SubAccountService} from '../../../shared/services/sub-account/sub-account.service';
import {DialogService} from "primeng/dynamicdialog";
import {SupportTicketCreateComponent} from "../support-ticket-create/support-ticket-create.component";
import {filter} from "rxjs/operators";
import {PaymentService} from "../../../shared/services/payments/payment.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";


@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnDestroy, OnInit {
  public navItems;
  public subscription: Subscription;
  public breadcrumbs: MenuItem[];
  public responsive = true;


  public sessionUser: UserMasterDto = new UserMasterDto();
  public appConstant = new AppConstant();
  public items: MenuItem[];
  public customerList: DropdownDto;
  public profile: any;
  public tabIndex = 0;
  public initials: string;
  public showInitials: boolean;


  public userName: any;
  public notifications: NotificationDto[] = [];
  public noOfNotifications = 0;
  public isVendor = false;
  public filteredCustomers: any;
  public customers: any;

  public isPortal = false;
  public subAccountList: DropdownDto = new DropdownDto();
  public subAccountId: string;
  public isNotificationTable = false;
  public subClientId;
  public nonPortalPrivilegeUser;
  public showUsBankLogo = false;

  constructor(public formBuilder: UntypedFormBuilder, public breadcrumbService: BreadcrumbService,
              public eventEmitterService: EventEmitterService, public notificationService: NotificationService,
              public app: AppMainComponent, public router: Router, public userService: UserService,
              public loginLogoutService: LoginLogoutService, public dashboardService: DashboardService,
              public messageService: MessageService, public tenantService: TenantService,
              public privilegeService: PrivilegeService, public paymentService: PaymentService,
              public webSocketService: WebSocketApiService, public notificationEventEmitter: NotificationEventEmitterService,
              public subAccountService: SubAccountService, public dialogService: DialogService) {

    this.breadcrumbService.breadcrumbChanged.subscribe(crumbs => {
      this.breadcrumbs = crumbs.map(c => this.toPrimeNgMenuItem(c));
    });

    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      if (privilegeService.isDemo()) {
        this.showUsBankLogo = event.url.includes('payments');
      }
    });

    this.navItems = JSON.parse(localStorage.getItem(AppConstant.NAV_ITEMS));

    this.isPortal = privilegeService.isPortal();
    // this.isPortal = true;

    this.startWebSocket();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    (window.innerWidth <= 991) ? this.responsive = false : this.responsive = true;
  }

  ngOnInit(): void {
    this.checkTenantStatus().then(r => {
      if (!r) {
        this.loginLogoutService.logOut(false);
        return;
      }
    });

    (window.innerWidth <= 991) ? this.responsive = false : this.responsive = true;

    this.sessionUser = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
    this.nonPortalPrivilegeUser = JSON.parse(localStorage.getItem(AppConstant.NON_PORTAL_PRIVILEGE_USER));
    this.userName = this.sessionUser.name;

    this.getIntegratedProvidersStatus();
    this.loadSubAccountList(this.subAccountList, this.sessionUser);

    this.userService.getUpdatedProfilePicPath.subscribe((data => {
      if (data === null) {
        return;
      }
      if (data.profilePic) {
        this.sessionUser.profilePic = data.profilePic;
        this.userService.downloadProfilePic(this.sessionUser);
        this.showInitials = false;
      } else if (!this.sessionUser.propicId) {
        localStorage.setItem(AppConstant.SESSION_USER_ATTR, JSON.stringify(this.sessionUser));
        this.createInitials(this.sessionUser);
      }
      this.userName = data.name;
    }));

    if (this.sessionUser.propicId || this.sessionUser.proficServerPath) {
      this.userService.downloadProfilePic(this.sessionUser);
      this.showInitials = false;
    } else {
      this.createInitials(this.sessionUser);
    }

    this.subAccountService.getUpdatedSubAccounts.subscribe((data => {
      if (!data) {
        return;
      }
      this.loadSubAccountList(this.subAccountList, this.sessionUser);
    }));

    if (this.eventEmitterService.portalSubAccountsSubscription === undefined) {
      this.eventEmitterService.portalSubAccountsSubscription =
        this.eventEmitterService.invokeSubAccountFunction.subscribe((name: string) => {
          this.loadSubAccountList(this.subAccountList, this.sessionUser);
        });
    }

    // SUBSCRIBE NOTIFICATION EVENT EMITTER //
    this.notificationEventEmitter.notificationsSubscription =
      this.notificationEventEmitter.invokeLoadNotifications.subscribe((notification) => {
        this.noOfNotifications = notification.notifications.length;
        this.notifications = notification.notifications;
      });
  }

  /**
   * Check tenant status before login
   */
  checkTenantStatus() {
    return new Promise(resolve => {
      this.loginLogoutService.getTenantStatus().subscribe((res: any) => {
        resolve(res.body)
      }, error => {
        resolve(true);
      })
    })
  }

  getIntegratedProvidersStatus(){
    this.paymentService.getIntegratedProvidersStatus().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
       this.privilegeService.paymentConfig = res.body;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // UNSUBSCRIBE NOTIFICATION EVENT EMITTER //
    if (this.notificationEventEmitter.notificationsSubscription) {
      this.notificationEventEmitter.notificationsSubscription.unsubscribe();
    }
    // END WEBSOCKET SUBSCRIPTION //
    if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      this.webSocketService.stopPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
    }

    setTimeout(() => {
      this.webSocketService.stopTenantNotificationService();
      this.webSocketService.disconnect();
    }, 5000);
    ///////////////////////////////
  }

  toPrimeNgMenuItem(crumb: Breadcrumb): any {
    return {label: crumb.displayName, url: `#${crumb.url}`} as MenuItem;
  }

  /**
   * Open Modal
   * @param value name of the menu
   */
  profileItemClicked(value: string) {
    switch (value) {
      case 'profile':
        this.profile = true;
        this.tabIndex = 0;
        this.isNotificationTable = false;
        break;
      case 'reset':
        this.profile = true;
        this.tabIndex = 1;
        this.isNotificationTable = false;
        break;
      case 'notification':
        this.profile = true;
        this.tabIndex = 2;
        this.isNotificationTable = true;
        break;
      case 'theme':
        this.profile = true;
        this.privilegeService.isSupport()
        && (!this.isPortal || this.subAccountId) ? this.tabIndex = 2 : this.tabIndex = 3;
        this.isNotificationTable = false;
        break;
      case 'logout':
        break;
    }
  }

  /**
   * This method use for create initial
   */
  public createInitials(sessionUser): void {
    this.showInitials = true;
    let initials = '';
    const splitted = sessionUser.name.split(this.appConstant.EMPTY_STRING_WITH_SPACE, 2);
    for (const str of splitted) {
      initials += str.charAt(0);
    }
    this.initials = initials;
  }


  /**
   * Close Profile Modal
   */
  modalClose() {
    this.profile = false;
  }


  filterVendorPortalCustomers(event: any) {
    this.dashboardService.getVendorPortalCustomers(event.query).subscribe((res) => {
      this.filteredCustomers = res.body;
    });
  }

  loadSubAccountList(listInstance: DropdownDto, user: UserMasterDto) {
    if (this.isPortal) {
      this.tenantService.getSubClientList(user).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          listInstance.data = res.body;
          if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
            this.subAccountId = localStorage.getItem(AppConstant.SUB_CLIENT_ID);
          }
        }
      });
    }
  }

  onSubClientListChange(event) {
    const clientId = localStorage.getItem(AppConstant.SUB_CLIENT_ID);
    if (this.privilegeService.isNoNetworkAvailable()) {
      setTimeout(() => {
        if (clientId) {
          this.subAccountId = clientId;
        } else {
          this.subAccountId = undefined;
        }
      }, 200);
      return;
    }
    this.webSocketService.stopPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
    localStorage.removeItem(AppConstant.SUB_CLIENT_ID);
    localStorage.setItem(AppConstant.SUB_CLIENT_ID, event.value);
    this.webSocketService.startPortalNotificationService(event.value);
    this.getRolePrivileges();
  }


  goToAgencyPortal() {
    if (this.privilegeService.isNoNetworkAvailable()) {
      return;
    }
    this.webSocketService.stopPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
    this.subAccountId = undefined;
    localStorage.removeItem(AppConstant.SUB_CLIENT_ID);
    this.getRolePrivileges();
  }


  /**
   * Get role privileges in Portal
   */
  getRolePrivileges() {
    this.dashboardService.getRolePrivileges().then(async (response: any) => {
        this.loadMenus(response.body);
      }
    );
  }

  /**
   * Load Sub Account Nav List
   */
  loadMenus(privileges) {
    this.dashboardService.getNavList().subscribe((response: any) => {
        localStorage.removeItem(AppConstant.NAV_ITEMS);
        localStorage.setItem(AppConstant.NAV_ITEMS, JSON.stringify(response.body));
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([response.body.dashBoardUrl]); // navigate to same route
          const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
          user.authorityList = null;
          user.authorityList = privileges;
          localStorage.removeItem(AppConstant.SESSION_USER_ATTR);
          localStorage.setItem(AppConstant.SESSION_USER_ATTR, JSON.stringify(user));
          window.dispatchEvent(new Event('resize'));
        });
      }
    );
  }


  /**
   * Panel Changed to identify subscription table and change width
   */
  panelChanged() {
    if (this.isPortal && !this.subAccountId) {
      this.isNotificationTable = false;
      return;
    }

    this.isNotificationTable = this.tabIndex === 2;

  }

  /**
   * Navigate Bys Url when Logo Clicked
   */
  navigateDashboard() {
    if (this.privilegeService.isPortal()) {
      if (this.subAccountId) {
        this.router.navigateByUrl('home/dashboard');
      } else {
        this.router.navigateByUrl('home/portal-dashboard');
      }
      return;
    }
    if (this.privilegeService.isSupport()) {
      this.router.navigateByUrl('support/dashboard');
      return;
    }
    if (this.privilegeService.isVendor()) {
      this.router.navigateByUrl('vendor/dashboard');
      return;
    }
    this.router.navigateByUrl('home/dashboard');
  }

  private startWebSocket() {
    setTimeout(() => {
      this.webSocketService.connect();
    }, 5000);
  }

  goToHelp() {
    window.open(ApiEndPoint.HELP_URL, '_blank');
  }

  supportTicket() {
    this.dashboardService.supportDialogRef = this.dialogService.open(SupportTicketCreateComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '40%',
      contentStyle: {overflow: 'auto'},
      styleClass: 'support-ticket-dialog-wrapper',
      closable: false,
    });
  }
}
