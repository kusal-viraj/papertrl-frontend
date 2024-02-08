import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoginRequestDto} from '../../../shared/dto/auth/login/login-request-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {LoginLogoutService} from '../../../shared/services/auth/login-logout.service';
import {TimeOutService} from '../../../shared/services/auth/time-out.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {ApiEndPoint} from '../../../shared/utility/api-end-point';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {WebSocketApiService} from '../../../shared/services/notification-subcription/web-socket-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginRequestDto: LoginRequestDto = new LoginRequestDto();

  public visibleSidebar2;
  public logInForm: UntypedFormGroup;
  public userName = AppConstant.EMPTY_STRING;
  public password = AppConstant.EMPTY_STRING;
  public sessionExpired = false;
  public passwordShow: boolean;
  public loginCredential = false;
  public loginFailedMessage: string;
  public isLoading = false;
  public tenantActive = true;

  constructor(public activatedRoute: ActivatedRoute, public router: Router, public formBuilder: UntypedFormBuilder,
              private loginService: LoginLogoutService, public refreshTokenService: TimeOutService,
              public privilegeService: PrivilegeService) {
  }


  async ngOnInit() {
    this.logInForm = this.formBuilder.group({
      userName: [AppConstant.EMPTY_STRING, Validators.required],
      password: [null, Validators.compose([Validators.required, Validators.maxLength(20)])],
      rememberMe: [true]
    });

    await this.checkTenantStatus();
    if (!this.tenantActive) return;

    const remember = localStorage.getItem(AppConstant.REMEMBER_ME)
    if (this.loginService.isUserLoggedIn() && JSON.parse(remember)) {
      this.navigateDashboard();
    }

    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.sessionExpired = (undefined !== queryParams.reason);


    this.visibleSidebar2 = true;
  }

  /**
   * Check tenant status before login
   */
  checkTenantStatus() {
    return new Promise(resolve => {
      this.loginService.getTenantStatus().subscribe((res: any) => {
        this.tenantActive = res.body;
        resolve(res.body)
      }, error => {
        this.tenantActive = true;
        resolve(true);
      })
    })
  }

  /**
   * this method can be used to hadle login function
   * @param value to form values
   */
  public login(value) {
    this.isLoading = true;
    this.loginRequestDto = value;
    if (this.logInForm.valid) {
      this.loginService.getAccessToken(this.loginRequestDto.userName, this.loginRequestDto.password).subscribe((res) => {
          localStorage.setItem(AppConstant.REMEMBER_ME, this.loginRequestDto.rememberMe + AppConstant.EMPTY_STRING);
          this.refreshTokenService.setLoginProperties(res, true, false);
        },
        error => {
          this.loginFailedMessage = error.error_description;
          this.loginCredential = true;
          this.isLoading = false;
        });
    } else {
      this.isLoading = false;
      new CommonUtility().validateForm(this.logInForm);
    }
  }


  /**
   * This method navigate to forgot password form
   */
  public resetPassword() {
    this.router.navigateByUrl('forgot-password');
  }

  /**
   * Route to trial page
   */
  public routeToTrialPage() {
    this.router.navigateByUrl('trial-request');

  }

  /**
   * Redirect to vendor Login from login page
   */
  vendorLoginRedirect() {
    document.location.href = ApiEndPoint.VENDOR_COMMUNITY_URL + 'login';
  }

  /**
   * Redirect to vendor Register from vendor login page
   */
  vendorRegisterRedirect() {
    this.router.navigateByUrl('register');
  }

  learnMore() {
    document.location.href = 'https://papertrl.com/';
  }

  /**
   * Navigate to Dashboard if logged in
   */
  navigateDashboard() {
    if (this.privilegeService.isPortal() && localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      this.router.navigateByUrl('home/dashboard')
      return;
    }
    if (this.privilegeService.isPortal()) {
      this.router.navigateByUrl('home/portal-dashboard')
      return;
    }
    if (this.privilegeService.isSupport()) {
      this.router.navigateByUrl('support/dashboard')
      return;
    }
    if (this.privilegeService.isVendor()) {
      this.router.navigateByUrl('vendor/dashboard')
      return;
    }
    this.router.navigateByUrl('home/dashboard')
  }
}
