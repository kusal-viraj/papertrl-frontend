import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {PrivilegeService} from '../services/privilege.service';
import {AppConstant} from '../utility/app-constant';

@Injectable({
  providedIn: 'root'
})
export class NetworkGuard implements CanActivate {
  constructor(private privilegeService: PrivilegeService, public router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.privilegeService.isNoNetworkAvailable()) {
      return false;
    }

    if (this.privilegeService.isPortal() && !localStorage.getItem(AppConstant.SUB_CLIENT_ID) && !state.url.includes('settings')) {
      let isPortalUrl = true;
      for (const url of AppConstant.PORTAL_SHORT_URLS) {
        if (state.url.includes(url)) {
          isPortalUrl = true;
          break;
        } else {
          isPortalUrl = false;
        }
      }
      if (!isPortalUrl) {
        this.router.navigate(['home/portal-dashboard']).then(() => {
          window.location.reload();
        });
        return true;
      }
    }
    if (this.privilegeService.isPortal() && localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      if (AppConstant.PORTAL_URLS.includes(state.url)) {
        this.router.navigate(['home/dashboard']).then(() => {
          window.location.reload();
        });
        return true;
      }
    }

    const slimMenu = JSON.parse(localStorage.getItem(AppConstant.NAV_ITEMS))?.slimMenu;
    const allowedSlimMenuRoutes = slimMenu?.flatMap(menuItem => menuItem.routerLink || []).flat();

    if (allowedSlimMenuRoutes && allowedSlimMenuRoutes.some(route => state.url.includes(route))) {
      return true;
    } else {
      this.router.navigate(['/home/access-denied']);
      return false;
    }
  }
}
