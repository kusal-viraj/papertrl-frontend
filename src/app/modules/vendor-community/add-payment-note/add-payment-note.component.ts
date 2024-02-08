import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PaymentsService} from '../../../shared/services/vendor-community/payments.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-add-payment-note',
  templateUrl: './add-payment-note.component.html',
  styleUrls: ['./add-payment-note.component.scss']
})
export class AddPaymentNoteComponent implements OnInit {

  public noteForm: UntypedFormGroup;
  @Output() updateTable = new EventEmitter();
  @Input() id;

  constructor(public formBuilder: UntypedFormBuilder, public paymentsService: PaymentsService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      note: ['', Validators.required],
    });
  }

  /**
   * This method use for create new uom
   * @param data to uom dto
   */
  addNote(data) {
    if (this.noteForm.valid) {
      this.paymentsService.addNote(data).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.UOM_CREATED_SUCCESSFULLY);
          this.updateTable.emit();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      new CommonUtility().validateForm(this.noteForm);
    }
  }
}
