import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PaymentService} from '../../../shared/services/payments/payment.service';

@Component({
  selector: 'app-change-expense-drawer',
  templateUrl: './change-expense-drawer.component.html',
  styleUrls: ['./change-expense-drawer.component.scss']
})
export class ChangeExpenseDrawerComponent implements OnInit {

  @Input() expenseId;
  @Input() id;
  @Output() refreshTable = new EventEmitter();
  public formGroup: UntypedFormGroup;
  public expenseList: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public paymentService: PaymentService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      expenseId: [null, Validators.required],
      id: []
    });

  }


  /**
   * This method use for change payment
   */
  changePayment() {
    this.formGroup.value.id = this.id;
    if (this.formGroup.valid) {
      this.paymentService.changeTaggedExpense(this.formGroup.value).subscribe({
        next: (res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
            this.notificationService.successMessage(HttpResponseMessage.CHECK_UPDATED_SUCCESSFULLY);
            this.refreshTable.emit('PAYMENT_UPDATE');
            this.reset();
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error: error => this.notificationService.errorMessage(error)
      });
    } else {
      new CommonUtility().validateForm(this.formGroup);
    }
  }

  /**
   * This method use for reset form
   */
  reset() {
    this.formGroup.reset();
  }
}
