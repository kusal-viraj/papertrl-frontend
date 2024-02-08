import {Component, OnInit, Output, EventEmitter, AfterViewInit, Input, ViewChild} from '@angular/core';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CreditCardBillCreateFormComponent} from '../credit-card-bill-create-form/credit-card-bill-create-form.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';

@Component({
  selector: 'app-credit-card-bill-create',
  templateUrl: './credit-card-bill-create.component.html',
  styleUrls: ['./credit-card-bill-create.component.scss']
})
export class CreditCardBillCreateComponent implements OnInit, AfterViewInit {

  @Output() onClose = new EventEmitter();
  @Output() updateGridEmit = new EventEmitter();
  @Input() selectionList = [];
  @Input() singleSelection;
  @ViewChild('cardBillCreateFormComponent') public cardBillCreateFormComponent: CreditCardBillCreateFormComponent;
  public visibleDialog = true;
  public transactionList = [];
  public scrollCards;
  public activeIndex = 0;

  constructor(public expenseService: ExpenseService, public notificationService: NotificationService,
              public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
    let obj;
    let transactionList = [];
    if (this.selectionList.length !== 0) {
      transactionList = this.selectionList.map(x => x.id);
      obj = transactionList;
    } else {
      transactionList.push(this.singleSelection.id);
      obj = transactionList;
    }
    this.expenseService.getSelectedTransactionsForBill(obj).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.transactionList = res.body;
      }
    }, error => this.notificationService.errorMessage(error))
  }

  left() {
    this.scrollCards.scrollBy(-1448, 0, 'smooth')

  }

  right() {
    this.scrollCards.scrollBy(1448, 0, 'smooth')
  }

  ngAfterViewInit(): void {
    this.scrollCards = document.getElementsByClassName('p-tabview-nav')[2];
  }

  updateGridAndRemoveCard() {
    this.updateGridEmit.emit();
    if (this.transactionList.length === 1) {
      this.onClose.emit();
    }
    if (this.activeIndex === this.transactionList.length - 1) {
      this.transactionList.splice(this.activeIndex, 1);
      this.activeIndex = this.transactionList.length - 1;
      return;
    }
    if (this.activeIndex < this.transactionList.length) {
      this.transactionList.splice(this.activeIndex, 1);
    }
  }

  updateTotalAndCount(event: any) {
    this.transactionList[this.activeIndex].trxCount = event.count;
    this.transactionList[this.activeIndex].totalAmount = event.total;
  }

  /**
   * this method used to close modal
   */
  onCloseModal() {
      this.onClose.emit();
  }

  getElement(i: number) {
    return document.getElementById('element_' + i);
  }
}
