import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {PrimeIcons} from "primeng/api";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {DashboardService} from "../../../shared/services/dashboard/dashboard.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {FormGuardService} from "../../../shared/guards/form-guard.service";

@Component({
  selector: 'app-support-ticket-manage',
  templateUrl: './support-ticket-manage.component.html',
  styleUrls: ['./support-ticket-manage.component.scss']
})
export class SupportTicketManageComponent implements OnInit {

  @Output() onClose = new EventEmitter();
  @Output() onSuccess = new EventEmitter();
  @Input() ticketId;

  public removeSpaces: RemoveSpace = new RemoveSpace();
  dataList = []
  public attachments: File[] = [];
  public formGroup: UntypedFormGroup
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public dashboardService: DashboardService,
              public notificationService: NotificationService, public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
    this.getTicketTimeLine();
    this.formGroup = this.formBuilder.group(
      {
        comment: [null, Validators.required],
      });
  }

  getTicketTimeLine() {
    this.dashboardService.getTicketTimeLine(this.ticketId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.dataList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }

  changeFileList(event) {
    this.attachments.push(...event.addedFiles);
  }

  /**
   * Create Ticket
   * @private
   */
  addComment() {
    if (!this.formGroup.valid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.loading = true;
    const formData = new FormData();

    formData.set('ticketId', this.ticketId);
    for (const file of this.attachments) {
      formData.append('attachment', file);
    }
    if (this.formGroup.get('comment').value) {
      formData.set('comment', this.formGroup.get('comment').value);
    }

    this.dashboardService.addComment(formData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        // this.notificationService.successMessage(HttpResponseMessage.SUPPORT_TICKET_DETAILS_UPDATED_SUCCESSFULLY);
        this.getTicketTimeLine();
        this.reset();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  public reset() {
    this.formGroup.reset();
    this.attachments = [];
  }

  /**
   * this method can be used to close support tickets edit mode
   */
  closeEditMode() {
    this.onClose.emit();
  }
}
