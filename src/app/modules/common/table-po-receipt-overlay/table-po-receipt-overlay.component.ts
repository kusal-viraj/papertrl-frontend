import {Component, Input, OnInit} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {PoService} from "../../../shared/services/po/po.service";
import {PoReceiptService} from "../../../shared/services/po-receipts/po-receipt.service";

@Component({
  selector: 'app-table-po-receipt-overlay',
  templateUrl: './table-po-receipt-overlay.component.html',
  styleUrls: ['./table-po-receipt-overlay.component.scss']
})
export class TablePoReceiptOverlayComponent implements OnInit {

  public poReceiptDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() id;

  constructor(public poReceiptService: PoReceiptService) {
  }

  ngOnInit(): void {
    this.poReceiptService.getSummaryPoReceiptData(this.id).subscribe((res) => {
      this.poReceiptDto = res.body;
    });
  }
}
