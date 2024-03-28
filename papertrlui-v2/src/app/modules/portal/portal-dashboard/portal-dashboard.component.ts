import {Component, OnInit} from '@angular/core';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppConstant} from "../../../shared/utility/app-constant";
import {Router} from "@angular/router";

@Component({
  selector: 'app-portal-dashboard',
  templateUrl: './portal-dashboard.component.html',
  styleUrls: ['./portal-dashboard.component.scss']
})
export class PortalDashboardComponent implements OnInit {

  public appAuthorities = AppAuthorities

  constructor(public router: Router, public privilegeService: PrivilegeService) {
    if (this.privilegeService.isPortal() && localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
      this.router.navigateByUrl('home/dashboard')
      return;
    }
  }

  ngOnInit(): void {
  }

}
