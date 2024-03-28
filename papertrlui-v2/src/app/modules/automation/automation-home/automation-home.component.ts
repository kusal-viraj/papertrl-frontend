import {Component, OnInit, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AutomationCreateComponent} from '../automation-create/automation-create.component';
import {AutomationListComponent} from '../automation-list/automation-list.component';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";


@Component({
  selector: 'app-automation-home',
  templateUrl: './automation-home.component.html',
  styleUrls: ['./automation-home.component.scss']
})
export class AutomationHomeComponent implements OnInit {

  public tabIndex = 0;

  public showCreateAutomation = false;
  public showViewAutomationList = false;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  public appAuthorities = AppAuthorities;
  @ViewChild('automationListComponent') automationListComponent: AutomationListComponent;

  constructor(public privilegeService: PrivilegeService, public automationService: AutomationService,
              public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
  }

  /**
   * This method use for handle tab change
   * @param tabIndex number
   */
  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
  }

  /**
   * This method use for show / hide automation action buttons
   * @param action string
   */
  changeAutomationAction(action) {
    if (action === 'CREATE') {
      this.showViewAutomationList = true;
      this.showCreateAutomation = true;
    } else if (action === 'SHOW_LIST') {
      this.showViewAutomationList = false;
      this.showCreateAutomation = false;
      this.automationService.updateTableData.next(true);
    }
  }

  /**
   * This method use for back to grid and refresh
   */
  refreshAutomationGrid() {
    this.changeAutomationAction('SHOW_LIST');
  }

  checkOnShow(){
    console.log('work');
  }
}
