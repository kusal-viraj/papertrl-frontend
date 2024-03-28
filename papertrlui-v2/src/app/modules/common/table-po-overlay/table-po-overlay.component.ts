import {Component, Input, OnInit} from '@angular/core';
import {PoOverlayService} from '../../../shared/services/po/po-overlay.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {PoService} from '../../../shared/services/po/po.service';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-table-po-overlay',
  templateUrl: './table-po-overlay.component.html',
  styleUrls: ['./table-po-overlay.component.scss']
})
export class TablePoOverlayComponent implements OnInit {

  public poDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() poId;

  constructor(public poService: PoService) {
  }

  ngOnInit(): void {
    this.poService.getSummaryPoData(this.poId).subscribe((res) => {
      this.poDto = res.body;
    });
  }
}
