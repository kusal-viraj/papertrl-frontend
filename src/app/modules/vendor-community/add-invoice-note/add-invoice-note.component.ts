import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PaymentsService} from '../../../shared/services/vendor-community/payments.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-add-invoice-note',
  templateUrl: './add-invoice-note.component.html',
  styleUrls: ['./add-invoice-note.component.scss']
})
export class AddInvoiceNoteComponent implements OnInit {

  public noteForm: UntypedFormGroup;
  @Output() updateTable = new EventEmitter();
  @Input() id;

  public obj;

  constructor(public formBuilder: UntypedFormBuilder, public paymentsService: PaymentsService, public notificationService: NotificationService,
              public httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.httpClient.get('assets/demo/data/dashboard-bar.json').subscribe((res: any) => {
      this.obj = res;
    })

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
