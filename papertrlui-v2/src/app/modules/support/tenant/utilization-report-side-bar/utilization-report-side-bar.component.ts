import {Component, OnInit} from '@angular/core';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {HttpClient} from '@angular/common/http';
import {TenantService} from '../../../../shared/services/support/tenant.service';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../../shared/utility/common-utility';

@Component({
  selector: 'app-utilization-report-side-bar',
  templateUrl: './utilization-report-side-bar.component.html',
  styleUrls: ['./utilization-report-side-bar.component.scss']
})
export class UtilizationReportSideBarComponent implements OnInit {


  public tenantList: any = [];
  public filterTransactionsDtaForm: FormGroup;
  public isProgress = false;

  constructor(public tenantService: TenantService, public notificationService: NotificationService,
              public http: HttpClient, public formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.loadTenantList();
  }

  /**
   * this method can be used to initialize form group
   */
  initFormGroup() {
    this.filterTransactionsDtaForm = this.formBuilder.group({
      tenantList: [null, Validators.required],
      dateRange: [null, Validators.required],
    });
  }

  /**
   * this method can be used to load tenants
   */
  loadTenantList() {
    this.tenantService.getTenantList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.tenantList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to submit form data
   */
  submitFormData() {
    this.isProgress = true;
    if (this.filterTransactionsDtaForm.valid) {
      this.tenantService.filterAccordingToSelectedValue(this.filterTransactionsDtaForm.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.isProgress = false;
        } else {
          this.isProgress = false;
          const element = document.createElement('a');
          element.style.display = 'none';
          element.href = window.URL.createObjectURL(res.data);
          element.download = 'export_file.xlsx';
          document.body.appendChild(element);
          element.click();
        }
      }, error => {
        this.isProgress = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isProgress = false;
      return new CommonUtility().validateForm(this.filterTransactionsDtaForm);
    }

  }
}

