import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {LoginLogoutService} from '../services/auth/login-logout.service';
import {PrivilegeService} from "../services/privilege.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, public privilegeService: PrivilegeService,
              private authService: LoginLogoutService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.isUserLoggedIn()) {
      return true;
    }

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 150);
    return false;

  }
}
