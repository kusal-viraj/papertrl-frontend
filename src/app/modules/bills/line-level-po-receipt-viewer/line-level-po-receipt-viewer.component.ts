import {Component, Input, OnInit} from '@angular/core';
import {AppConstant} from "../../../shared/utility/app-constant";
import {BillLineLevelPoReceiptDto} from "../../../shared/dto/bill/bill-line-level-po-receipt-dto";

@Component({
  selector: 'app-line-level-po-receipt-viewer',
  templateUrl: './line-level-po-receipt-viewer.component.html',
  styleUrls: ['./line-level-po-receipt-viewer.component.scss']
})
export class LineLevelPoReceiptViewerComponent implements OnInit {
  @Input() expensePoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [];
  @Input() itemPoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [];

  public appConstant: AppConstant = new AppConstant();

  constructor() { }

  ngOnInit(): void {
  }

}
