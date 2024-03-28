import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {DataFormat} from '../../../shared/utility/data-format';
import {TableSupportBase} from '../../../shared/utility/table-support-base';

@Component({
  selector: 'app-audit-trial',
  templateUrl: './audit-trial.component.html',
  styleUrls: ['./audit-trial.component.scss']
})
export class AuditTrialComponent implements OnInit {

  @Input() auditTrial: AuditTrialDto[];
  @Input() panelShow: any;
  @Input() heading: any;
  @Output() closeDrawer = new EventEmitter();
  public dateFormatter: DataFormat = new DataFormat();
  public tableSupportBase = new TableSupportBase();

  constructor() { }

  ngOnInit(): void {
  }
}
