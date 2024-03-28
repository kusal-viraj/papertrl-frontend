import {Injectable} from '@angular/core';
import {timer} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {AppConstant} from '../../utility/app-constant';
import {HttpResponseMessage} from '../../utility/http-response-message';
import {ApiEndPoint} from '../../utility/api-end-point';
import {WebSocketApiService} from "../notification-subcription/web-socket-api.service";

@Injectable({
  providedIn: 'root'
})
export class TimeOutService {

  public timerInstance;
  public refreshToken = false;

  constructor(private httpClient: HttpClient, private router: Router, public webSocketApiService: WebSocketApiService) {
  }

  /**
   * This method can be used to intialize the resfresh token timer
   * @param startTime start after fix delay in millisecond
   * @param repeat repeat every
   */
  public setTimeOut(startTime, repeat) {
    const source = timer(startTime, repeat);
    this.timerInstance = source.subscribe(val => {
      if (!localStorage.getItem(AppConstant.ACCESS_TOKEN)) {
        this.unsubScribeTimeOut();
      } else {
        this.refreshAccessToken().subscribe((res: any) => {
            this.setLoginProperties(res, false, true);
          },
          error => {
            this.timerInstance.unsubscribe();
            this.webSocketApiService.stopTenantNotificationService();
            if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
              this.webSocketApiService.stopPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
            }
            this.clearLocalStorage();
            this.router.navigate(['/login'], {queryParams: {reason: HttpResponseMessage.SESSION_EXPIRED}});
          });
      }
    });
  }

  /**
   * This method can be used to unsubscribe the current token refresh timer
   */
  public unsubScribeTimeOut() {
    if (null !== this.timerInstance && undefined !== this.timerInstance) {
      this.timerInstance.unsubscribe();
    }
  }

  /**
   * This method will be automatically called if the used logged in by activating remember me option in the login page
   */
  public refreshAccessToken() {
    const params = new URLSearchParams();
    localStorage.removeItem(AppConstant.ACCESS_TOKEN);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', localStorage.getItem(AppConstant.REFRESH_TOKEN));
    params.append('scope', 'read write');
    const headers = new HttpHeaders({
      'authExempt': 'true',
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization: 'Basic ' + btoa('angular_app_client_' + ApiEndPoint.DOMAIN_NAME + ':985e27f5-a4e4-41c5-a14b-9f3b90f5eb8d')
    });
    return this.httpClient.post(ApiEndPoint.API_URL + '/oauth/token',
      params.toString(), {headers, observe: 'response'}
    )
  }

  /**
   * This methid can used to set successfully logged in properties to local storage such as Access Token, Refresh Token, ect
   * @param res logged in response
   * @param isLogin true if a fresh login otherwise false
   * @param onTokenRefresh is from refresh
   */
  public setLoginProperties(res: any, isLogin: boolean, onTokenRefresh) {

    const accessTokenExpireTime = new Date();
    const accessTokenExpiresIn = Number(res.body.expires_in);
    accessTokenExpireTime.setSeconds(accessTokenExpireTime.getSeconds() + accessTokenExpiresIn);

    const refreshTokenExpireTime = new Date();
    refreshTokenExpireTime.setSeconds(refreshTokenExpireTime.getSeconds() + Number(res.body.refresh_token_expires_in));

    // Set local storage variables
    localStorage.setItem(AppConstant.REFRESH_TOKEN, res.body.refresh_token);
    localStorage.setItem(AppConstant.ACCESS_TOKEN_EXPIRES_AT, accessTokenExpireTime.toString());
    localStorage.setItem(AppConstant.REFRESH_TOKEN_EXPIRES_AT, refreshTokenExpireTime.toString());
    localStorage.setItem(AppConstant.ACCESS_TOKEN, res.body.access_token);
    // Set local storage variables

    this.unsubScribeTimeOut();
    if (AppConstant.STRING_TRUE === localStorage.getItem(AppConstant.REMEMBER_ME)) {
      this.setTimeOut((accessTokenExpiresIn - (60 * 1)) * 1000, 1000 * 60);
    }

    if (isLogin) {
      this.httpClient.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_user_nav_list', {observe: 'response'})
        .subscribe((response: any) => {
            localStorage.setItem(AppConstant.NAV_ITEMS, JSON.stringify(response.body));
            localStorage.setItem(AppConstant.NON_PORTAL_PRIVILEGE_USER, response.body.isNonPortalPrivilegeRole);

            if (response.body.isNonPortalPrivilegeRole) {
              localStorage.removeItem(AppConstant.SUB_CLIENT_ID);
              localStorage.setItem(AppConstant.SUB_CLIENT_ID, response.body.subAccount);
            }

            if (onTokenRefresh || isLogin){
              this.getAuthenticatedUser(response.body.dashBoardUrl, onTokenRefresh);
            }
          },
          error => {
            this.clearLocalStorage();
          }
        );
    }
  }

  /**
   * This method can be used to load current logged in user to local storage
   */
  public getAuthenticatedUser(url, onTokenRefresh) {
    this.httpClient.get<any>(ApiEndPoint.API_URL + '/user_management/sec_view_authenticated_user', {observe: 'response'})
      .subscribe((res: any) => {
          localStorage.setItem(AppConstant.SESSION_USER_ATTR, JSON.stringify(res.body));
          window.dispatchEvent(new Event('resize'));
          if (!onTokenRefresh) {
            this.router.navigateByUrl(url)
            // this.router.navigate([url], {queryParams: {reason: HttpResponseMessage.SESSION_EXPIRED}});
          }

        },
        error => {
          this.clearLocalStorage();
        }
      );
  }

  clearLocalStorage() {
    this.unsubScribeTimeOut();
    localStorage.removeItem(AppConstant.SESSION_USER_ATTR);
    localStorage.removeItem(AppConstant.REFRESH_TOKEN);
    localStorage.removeItem(AppConstant.ACCESS_TOKEN_EXPIRES_AT);
    localStorage.removeItem(AppConstant.REFRESH_TOKEN_EXPIRES_AT);
    localStorage.removeItem(AppConstant.ACCESS_TOKEN);
    localStorage.removeItem(AppConstant.NAV_ITEMS);
    localStorage.removeItem(AppConstant.REMEMBER_ME);
    localStorage.removeItem(AppConstant.SUB_CLIENT_ID);
  }
}
