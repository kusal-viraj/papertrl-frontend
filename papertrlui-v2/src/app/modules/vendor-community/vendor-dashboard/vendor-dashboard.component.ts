import {Component, HostListener, OnInit} from '@angular/core';
import {TaskListDto} from '../../../shared/dto/dashboard/task-list-dto';
import {InfoCardsDto} from '../../../shared/dto/dashboard/info-cards-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BreadcrumbService} from '../../../shared/services/breadcrumb.service';
import {Router} from '@angular/router';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {VendorDashboardService} from '../../../shared/services/dashboard/vendor-dashboard.service';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit {


  public taskList: TaskListDto[];
  public infoCards: InfoCardsDto = new InfoCardsDto();
  public showToDo = false;
  public noOfTasksOnPage;
  public customerList: DropdownDto;
  public barData: any;
  public lineData: any;
  public appAuthorities = AppAuthorities;

  constructor(public router: Router, public dashboardService: VendorDashboardService, public privilegeService: PrivilegeService) {
  }

  ngOnInit() {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (innerWidth <= 540) {
      this.noOfTasksOnPage = 1;
    } else if (window.innerWidth <= 700) {
      this.noOfTasksOnPage = 2;
    } else if (window.innerWidth <= 991) {
      this.noOfTasksOnPage = 3;
    } else {
      this.noOfTasksOnPage = 4;
    }
  }


  markAsDone(id) {
    // this.dashboardService.taskDone(id).subscribe((res) => {
    //
    // });
    const index = this.taskList.findIndex(x => x.id === id);
    this.taskList.splice(index, 1);
    if (this.taskList.length === 0) {
      this.showToDo = false;
    }

  }
}
