import {AppConstant} from '../../utility/app-constant';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpResponseMessage} from '../../utility/http-response-message';
import {TimeOutService} from './time-out.service';
import {Router} from '@angular/router';
import {ApiEndPoint} from '../../utility/api-end-point';
import {Observable} from 'rxjs';
import {WebSocketApiService} from '../notification-subcription/web-socket-api.service';
import {DashboardService} from "../dashboard/dashboard.service";


@Injectable({
  providedIn: 'root'
})
export class LoginLogoutService {

  logoutResult: boolean;

  constructor(private httpClient: HttpClient, private router: Router, public dashboardService: DashboardService,
              private tokenValidateService: TimeOutService, public webSocketService: WebSocketApiService) {
  }

  /**
   * This method will get trigger when a user trying to log into the system
   * @param userName of the user
   * @param password of the user
   */
  public getAccessToken(userName, password) {
    this.clearLocalStorage(false);
    const params = new URLSearchParams();
    params.append('username', userName);
    params.append('password', password);
    params.append('grant_type', 'password');
    params.append('scope', 'read write');
    const headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization: 'Basic ' + btoa('angular_app_client_' + ApiEndPoint.DOMAIN_NAME + ':985e27f5-a4e4-41c5-a14b-9f3b90f5eb8d')
    });
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/oauth/token',
      params.toString(), {headers, observe: 'response'});
  }

  /**
   * This method will return the current logged in user
   */
  public getUserDetails() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/user_management/sec_view_user_byuserid', {observe: 'response'});
  }


  /**
   * This method will return true or false after checking if the current logged in user in local storage
   */
  public isUserLoggedIn() {
    return null != localStorage.getItem(AppConstant.SESSION_USER_ATTR);
  }

  /**
   * This method will get trigger when a user trying to logout from the system
   * @param isTokenExpired check if the logout calls automatically or after token invalidation
   */
  public logOut(isTokenExpired: boolean) {
    this.tokenValidateService.unsubScribeTimeOut();
    ////////////// STOP WEB SOCKET /////////////////
    this.webSocketService.stopTenantNotificationService();
    if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      this.webSocketService.stopPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
    }
    //////////////////////////////////////////////////
    if (!isTokenExpired) {
      this.httpClient.get<Observable<boolean>>(ApiEndPoint.API_URL + '/auth/login_out',
        {params: {tokenId: localStorage.getItem(AppConstant.ACCESS_TOKEN)}}).subscribe((res: any) => {
        this.logoutResult = res;
      });
    }
    this.clearLocalStorage(true);
    if (isTokenExpired) {
      this.router.navigate(['/login'], {queryParams: {reason: HttpResponseMessage.SESSION_EXPIRED}});
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  clearLocalStorage(removeClientId) {
    // Close Support Modal if open
    if (this.dashboardService.supportDialogRef) {
      this.dashboardService.supportDialogRef.close();
    }
    localStorage.removeItem(AppConstant.SESSION_USER_ATTR);
    localStorage.removeItem(AppConstant.REFRESH_TOKEN);
    localStorage.removeItem(AppConstant.ACCESS_TOKEN_EXPIRES_AT);
    localStorage.removeItem(AppConstant.REFRESH_TOKEN_EXPIRES_AT);
    localStorage.removeItem(AppConstant.ACCESS_TOKEN);
    localStorage.removeItem(AppConstant.NAV_ITEMS);
    localStorage.removeItem(AppConstant.REMEMBER_ME);
    if (removeClientId) {
      localStorage.removeItem(AppConstant.SUB_CLIENT_ID);
    }
  }

  getTenantStatus() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_tenant_status', {observe: 'response'});
  }
}
