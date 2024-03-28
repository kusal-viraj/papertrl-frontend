import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {DataFormat} from '../../../shared/utility/data-format';

@Component({
  selector: 'app-bill-audit-trial',
  templateUrl: './bill-audit-trial.component.html',
  styleUrls: ['./bill-audit-trial.component.scss']
})
export class BillAuditTrialComponent implements OnInit {

  @Input() auditTrial: AuditTrialDto[];
  @Input() panelShow: any;
  @Input() heading: any;
  @Output() closeDrawer = new EventEmitter();
  public dateFormatter: DataFormat = new DataFormat();

  constructor() { }

  ngOnInit(): void {
  }

}
