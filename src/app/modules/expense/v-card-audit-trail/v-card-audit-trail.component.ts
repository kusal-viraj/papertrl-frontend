import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataFormat} from '../../../shared/utility/data-format';
import {TableSupportBase} from '../../../shared/utility/table-support-base';

@Component({
  selector: 'app-v-card-audit-trail',
  templateUrl: './v-card-audit-trail.component.html',
  styleUrls: ['./v-card-audit-trail.component.scss']
})
export class VCardAuditTrailComponent implements OnInit {


  @Input() auditTrial;
  @Input() panelShow: any;
  @Input() heading: any;
  @Input() cardNo: any;
  @Output() closeDrawer = new EventEmitter();
  public dateFormatter: DataFormat = new DataFormat();
  public tableSupportBase = new TableSupportBase();

  constructor() {
  }

  ngOnInit(): void {
  }

}
