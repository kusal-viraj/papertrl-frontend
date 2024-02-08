import {BatchTransaction} from './batch-transaction';


export class BatchPayment {
  id: number;
  providerId: number;
  batchTransactions: BatchTransaction [] = [];
  adHocWorkflowDetails: [] = [];
  scheduleHours = 0;
  scheduleMinutes = 0;
  scheduledDateStr: Date;
  today: Date;
  approvalUser: string;
  remarks: string;

  constructor(payments: any [], util) {
    this.today = new Date();
    payments.forEach(value => {
      this.batchTransactions.push(new BatchTransaction(value, util));
    });
  }
}
