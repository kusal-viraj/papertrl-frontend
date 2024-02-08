import {Component, Input, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {MissingReportFormComponent} from "../missing-report-form/missing-report-form.component";
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-receipt-popup-manage',
  templateUrl: './receipt-popup-manage.component.html',
  styleUrls: ['./receipt-popup-manage.component.scss']
})
export class ReceiptPopupManageComponent implements OnInit {
  @ViewChild('missingReportFormComponent') public missingReportFormComponent: MissingReportFormComponent;

  @Input() item: any;
  @Input() fromExpense = false;
  @Input() fromGrid = false;
  @Input() viewOnly = false;
  @Input() expenseLineItems: any = [];
  @Input() lineNumber = 0;
  @Output() actionComplete = new EventEmitter();
  @Output() selectAction = new EventEmitter();
  @Output() attachExpenseReceipt = new EventEmitter();
  activeTransaction: any;
  selectedReceiptId: any;
  showReceiptPopup = false;
  selectedMissingReceiptId: any;
  showMissingReceiptPopup = false;

  constructor(public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
    if (this.fromGrid) {
      this.item.merchant = this.item['transaction.merchant'];
      this.item.cardNoStr = this.item['transaction.cardNo'];
      this.item.amount = this.item['transaction.amount'];
      this.item.receiptId = this.item['transaction.receiptId'];
      this.item.missingReceiptFormId = this.item['transaction.missingReceiptFormId'];
      this.item.missingReceiptAvailabilityBln = this.item['transaction.missingReceiptAvailability'];
    }
  }


  /**
   * Returns the name of the merchant and the amount merging together
   * @param item
   */
  getReceiptNameForButton(item: any) {
    if (this.fromExpense) {
      return this.item.receiptFileName;
    }
    return item.receiptFileName ? item.receiptFileName : '';
  }

  /**
   * Missing form link clicked
   * @param data the transaction data of that specific line
   */
  missingFormClicked(data) {
    this.selectedReceiptId = data.receiptId;
    this.selectedMissingReceiptId = data.formId;
    this.showMissingReceiptPopup = true;
    this.showReceiptPopup = true;
    this.activeTransaction = data;
  }

  /**
   * Attach a missing receipt
   * Save the missing receipt id and save data
   * @param data Receipt object
   */
  attachMissingReceiptData(data: any) {
    this.showMissingReceiptPopup = false;
    // this.activeTransaction.missingReceiptFormId = data.id;
    this.actionComplete.emit();
  }

  /**
   * Attach a receipt for statement from receipt list
   * Removes the receipt id from other statements if present
   * @param data Receipt object
   */
  attachData(data: any) {
    this.selectedReceiptId = data.receiptId;
  }

  /**
   * Send the receipt id for grid
   */
  updateGrid() {
    if (!this.viewOnly) {
      this.actionComplete.emit(this.selectedReceiptId)
    }
  }

  missingReceiptToggle() {
    this.showMissingReceiptPopup = false;
    this.actionComplete.emit();
  }

  attachReceipt(event) {
    if (!event) {
      this.showReceiptPopup = false;
      return;
    }
    if (this.fromExpense) {
      this.selectedReceiptId = event.receiptId;
      this.attachExpenseReceipt.emit(event);
    } else {
      this.attachData(event);
      this.updateGrid();
    }
    this.showReceiptPopup = false;
  }
}
