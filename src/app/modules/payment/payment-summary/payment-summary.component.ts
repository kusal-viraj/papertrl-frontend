import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Subscription} from "rxjs";
import {PaymentService} from "../../../shared/services/payments/payment.service";

@Component({
  selector: 'app-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss']
})
export class PaymentSummaryComponent implements OnInit, OnDestroy {

  @Input() fromCreate = false;
  @Input() paymentDetails: any;
  @Input() paymentForm: any;
  @Input() paymentTypes: any[];
  @Input() approvalUsers: any[];
  @Input() approvalGroups: any[];
  @Input() isWorkFlow = false;
  @Input() isSchedule = false;
  @Input() buttonDetails: any;

  @Output() onClose = new EventEmitter();
  @Output() onSubmit = new EventEmitter();
  public subscription = new Subscription();
  public loadingConfirm = false;
  public commonUtil = new CommonUtility();
  public appConstant: AppConstant = new AppConstant();

  constructor(private sanitizer: DomSanitizer, private paymentService: PaymentService) {
  }

  ngOnInit(): void {
    // this.paymentDetails.payeeWiseTransactionList.forEach(val => {
    //   if (val.vcardList && val.vcardList.length === 0) {
    //     val.vcardList = [];
    //     val.vcardList.splice(0, 0, {id: 0, name: 'Create a new Card'});
    //   } else if (val.vcardList.length > 0) {
    //     val.vcardList.splice(0, 0, {id: 0, name: 'Create a new Card'});
    //   }
    //   val.cardId = 0;
    // });
    this.paymentService.updatePaymentSummaryBtnStatus.subscribe(value => {
      if (value){
        this.loadingConfirm = false;
      }
    });
  }

  getLogo(providerLogo: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + providerLogo);
  }

  getTotalOfLine(t) {
    return t.reduce((a, b) => a + (b.amount || 0), 0);
  }

  getPaymentTypeName(txnType: any) {
    return this.paymentTypes.find(x => x.id === txnType).name;
  }

  getApprovalUserName(id: any) {
    if (!id) {
      return '-';
    }
    return this.approvalUsers.find(x => x.id === id).name;
  }

  getApprovalGroupName(id: any) {
    if (!id) {
      return '-';
    }
    return this.approvalGroups.find(x => x.id === id).name;
  }

  submit() {
    const tempArr = [];
    this.loadingConfirm = true;
    this.paymentDetails.payeeWiseTransactionList.forEach(v => {
      for (const transaction of v.transactionList) {
        transaction.singleCardForBatch = v.singleCardForBatch;
        transaction.cardId = v.cardId ? v.cardId : null;
        tempArr.push(transaction);
      }
    });
    this.paymentForm.transactionList = tempArr;
    this.onSubmit.emit(this.paymentForm);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
