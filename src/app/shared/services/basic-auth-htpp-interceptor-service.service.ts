import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {retry, catchError, switchMap, take, filter} from 'rxjs/operators';
import {Router} from '@angular/router';

import {AppConstant} from '../utility/app-constant';
import {LoginLogoutService} from './auth/login-logout.service';
import {TimeOutService} from './auth/time-out.service';
import {NotificationService} from "./notification/notification.service";
import {HttpResponseMessage} from "../utility/http-response-message";
import {PrivilegeService} from "./privilege.service";
import {ApiEndPoint} from "../utility/api-end-point";

@Injectable({
  providedIn: 'root'
})
export class BasicAuthHttpInterceptorServiceService implements HttpInterceptor {

  constructor(private router: Router, private tokenRevalidateService: TimeOutService, public privilegeService: PrivilegeService,
              private loginLogOutService: LoginLogoutService, public notificationService: NotificationService) {
  }

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.privilegeService.networkStatus) {
      return;
    }

    if (localStorage.getItem(AppConstant.ACCESS_TOKEN) != null) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + localStorage.getItem(AppConstant.ACCESS_TOKEN)
        }
      });
    }
    if (localStorage.getItem(AppConstant.SESSION_ID) != null) {
      req = req.clone({
        setHeaders: {
          'X-Auth-Token': localStorage.getItem(AppConstant.SESSION_ID)
        }
      });
    }
    if (localStorage.getItem(AppConstant.CSRF_TOKEN) != null) {
      req = req.clone({
        setHeaders: {
          'X-CSRF-TOKEN': localStorage.getItem(AppConstant.CSRF_TOKEN)
        }
      });
    }
    if (localStorage.getItem(AppConstant.SUB_CLIENT_ID) != null) {
      req = req.clone({
        setHeaders: {
          'SUB-CLIENT-ID': localStorage.getItem(AppConstant.SUB_CLIENT_ID)
        }
      });
    }

    return next.handle(req).pipe(
      retry(0),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = error.error.error;
        } else {
          // server-side error
          errorMessage = error.error;
        }
        if (error.status === AppConstant.FORBIDDEN) {
          this.notificationService.errorMessage(HttpResponseMessage.FORBIDDEN_MESSAGE)
        }
        if (error.status === AppConstant.UN_AUTHORIZED) {
          return this.handle401Error(req, next);
        }
        if (error.status === AppConstant.BAD_REQUEST && error.url.includes('oauth/token')) {
          this.loginLogOutService.logOut(true);
        }
        if (error.status === AppConstant.NOT_ACCEPTABLE) {
          if (req.url.indexOf('/oauth/token') < 0) {
            this.loginLogOutService.logOut(true);
          }
        }
        return throwError(errorMessage);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!request.url.includes('oauth/token') && localStorage.getItem(AppConstant.REFRESH_TOKEN) && AppConstant.STRING_TRUE === localStorage.getItem(AppConstant.REMEMBER_ME)) {
      if (!this.tokenRevalidateService.refreshToken) {
        this.refreshTokenSubject.next(null);
        this.tokenRevalidateService.refreshToken = true;
        return this.tokenRevalidateService.refreshAccessToken().pipe(
          catchError((error, caught) => {
            this.tokenRevalidateService.refreshToken = false;
            this.loginLogOutService.logOut(true);
            return throwError(error);
          }),
          switchMap((res: any) => {
            if (res.body.access_token) {
              this.refreshTokenSubject.next(res.body.access_token);
              this.tokenRevalidateService.refreshToken = false;
              this.tokenRevalidateService.setLoginProperties(res, true, true);
              return next.handle(this.addTokenHeader(request, res.body.access_token));
            }
            this.loginLogOutService.logOut(true);
          })
        )
      }
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token)))
      );
    } else {
      this.loginLogOutService.logOut(true);
    }


  }


  addTokenHeader(request: HttpRequest<any>, token: string) {
    /* for Spring Boot back-end */
    return request.clone({headers: request.headers.set('Authorization', 'Bearer  ' + token)});
  }

}

