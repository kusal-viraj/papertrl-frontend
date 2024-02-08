import {Component, OnInit, ViewChild} from '@angular/core';
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {ItemState} from "../../item/item-home/item-home.component";
import {SupportTicketCreateComponent} from "../../dashboard/support-ticket-create/support-ticket-create.component";
import {DashboardService} from "../../../shared/services/dashboard/dashboard.service";
import {DialogService} from "primeng/dynamicdialog";
import {SupportTicketListComponent} from '../support-ticket-list/support-ticket-list.component';

@Component({
  selector: 'app-support-ticket-home',
  templateUrl: './support-ticket-home.component.html',
  styleUrls: ['./support-ticket-home.component.scss']
})
export class SupportTicketHomeComponent implements OnInit {

  @ViewChild('supportTicketListComponent') supportTicketListComponent: SupportTicketListComponent;

  constructor(public privilegeService: PrivilegeService, public dashboardService: DashboardService,
              public dialogService: DialogService) {
  }

  ngOnInit(): void {
  }

  openCreateTicket() {
    this.dashboardService.supportDialogRef = this.dialogService.open(SupportTicketCreateComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '40%',
      contentStyle: {overflow: 'auto'},
      closable: false,
    });
  }
}
