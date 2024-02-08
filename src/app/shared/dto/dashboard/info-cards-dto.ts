export class InfoCardsDto {
  vendorRequest: any;
  billsPending: any;
  billsRejected: any;
  poPending: any;
  poRejected: any;
  expensesPending: any;
  expensesRejected: any;

  constructor() {
    this.vendorRequest = 0;
    this.billsPending = 0;
    this.billsRejected = 0;
    this.poPending = 0;
    this.poRejected = 0;
    this.expensesPending = 0;
    this.expensesRejected = 0;
  }
}
