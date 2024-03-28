import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CompareDate} from '../../../shared/utility/compare-date';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-mark-as-mailed-drawer',
  templateUrl: './mark-as-mailed-drawer.component.html',
  styleUrls: ['./mark-as-mailed-drawer.component.scss']
})
export class MarkAsMailedDrawerComponent implements OnInit {
  markAsMailedForm: UntypedFormGroup;
  public billPaymentDto: BillPaymentMasterDto = new BillPaymentMasterDto();
  isEarlyDate = true;
  @Input() paymentDate: any;
  @Input() id: number;
  @Output() refreshTable = new EventEmitter();

  constructor(public paymentService: BillPaymentService, public formBuilder: UntypedFormBuilder,
              public messageService: MessageService, public notificationService: NotificationService,
  ) {
  }

  ngOnInit(): void {
    this.markAsMailedForm = this.formBuilder.group({
      mailedDate: [AppConstant.EMPTY_STRING, Validators.required],
      id: []
    });
  }

  /**
   * this method used to submit the form
   */
  onSubmit() {
    this.markAsMailedForm.get('id').setValue(this.id);
    this.billPaymentDto.mailedDate = this.markAsMailedForm.value.mailedDate;
    this.billPaymentDto.id = this.markAsMailedForm.value.id;
    if(this.billPaymentDto.mailedDate) {
      this.paymentService.markCheckAsMailed(this.billPaymentDto).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.CHECK_MAILED_SUCCESSFULLY);
          this.refreshTable.emit('PAYMENT_UPDATE');
          this.resetForm();
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }else {
      new CommonUtility().validateForm(this.markAsMailedForm);
    }
  }


  /**
   * this method can be used to change mailed date
   * @param event to change event
   */
  onChangeDate(event) {
    if (undefined !== this.paymentDate && undefined !== event && null !== event) {
      this.isEarlyDate = CompareDate.compare(this.paymentDate, event);
    }
  }

  /**
   * this method used to reset the form
   */
  resetForm() {
    this.markAsMailedForm.reset();
  }
}
