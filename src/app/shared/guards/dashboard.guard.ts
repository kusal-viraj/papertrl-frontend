import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LoginLogoutService} from "../services/auth/login-logout.service";
import {PrivilegeService} from "../services/privilege.service";
import {AppConstant} from "../utility/app-constant";

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {
  constructor(private router: Router,
              private privilegeService: PrivilegeService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.privilegeService.isPortal()) {
      if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
        this.router.navigateByUrl('home/dashboard')
      } else {
        this.router.navigateByUrl('home/portal-dashboard')
      }
      return;
    }
  }

}
