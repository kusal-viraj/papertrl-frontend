import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';

@Component({
  selector: '[app-work-flow-section]',
  templateUrl: './work-flow-section.component.html',
  styleUrls: ['./work-flow-section.component.scss']
})
export class WorkFlowSectionComponent implements OnInit {


  @Input() adHocWorkflowDetails;
  @Input() form;
  @Output() removeAdHocWorkflowEmit = new EventEmitter();
  @Output() addAdHocWorkflowDetailEmit = new EventEmitter();

  @Input() approvalUserList: DropdownDto = new DropdownDto();
  @Input() approvalGroupList: DropdownDto = new DropdownDto();
  @Input() isWorkflowConfigAvailable = false;
  @Input() matchingAutomation: any;


  constructor(public billsService: BillsService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
  }

  removeAdHocWorkflow(adHocIndex: number) {
    this.removeAdHocWorkflowEmit.emit(adHocIndex);
  }

  addAdHocWorkflowDetail() {
    this.addAdHocWorkflowDetailEmit.emit();
  }
}
