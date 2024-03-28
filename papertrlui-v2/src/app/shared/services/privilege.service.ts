import {Injectable} from '@angular/core';
import {AppConstant} from '../utility/app-constant';
import {ApiEndPoint} from '../utility/api-end-point';
import {LoginLogoutService} from './auth/login-logout.service';
import {fromEvent} from 'rxjs';
import {NotificationService} from './notification/notification.service';
import {HttpResponseMessage} from '../utility/http-response-message';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  public networkStatus: boolean;
  public paymentConfig = true;

  constructor(public loginLogoutService: LoginLogoutService, public notificationService: NotificationService,
              private sanitizer: DomSanitizer) {
    this.networkStatus = window.navigator.onLine;
    fromEvent(window, 'online').subscribe(e => {
      this.networkStatus = true;
    });
    fromEvent(window, 'offline').subscribe(e => {
      this.networkStatus = false;
    });
  }

  isAuthorized(access) {
    try {
      const obj = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
      return (obj.authorityList).includes(access);

    } catch (e) {
      this.loginLogoutService.logOut(true);
    }
  }


  isAuthorizedMultiple(access: any[]) {
    try {
      const obj = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
      for (const item of access) {
        if ((obj.authorityList).includes(item)) {
          return true;
        }
      }
    } catch (e) {
      this.loginLogoutService.logOut(true);
    }
  }

  isNoNetworkAvailable(): boolean {
    if (!this.networkStatus) {
      this.notificationService.infoMessage(HttpResponseMessage.NO_INTERNET);
    }
    return !this.networkStatus;
  }

  convertBase64toImage(base) {
    if (base) {
      return this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base);
    }
  }

  isPortal() {
    return ApiEndPoint.DOMAIN_NAME.includes(AppConstant.PORTAL_SYSTEM);
  }

  isVendor() {
    return ApiEndPoint.DOMAIN_NAME.includes(AppConstant.VENDOR_SYSTEM);
  }

  isSupport() {
    return ApiEndPoint.DOMAIN_NAME.includes(AppConstant.SUPPORT_SYSTEM);
  }

  isExusPartner() {
    return (window.location.hostname.includes(ApiEndPoint.EXUS_PARTNER));
  }

  isMobile(): boolean {
    return window.innerWidth < 990;
  }

  isDemo() {
    return ApiEndPoint.DEMO_ENV;
  }

  isPaymentConfig() {
    return this.paymentConfig;
  }
}
