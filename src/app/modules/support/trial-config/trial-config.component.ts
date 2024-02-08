import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {TrialManagementService} from '../../../shared/services/support/trial-management.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {TrialUtility} from './trial-utility/trial-utility';

@Component({
  selector: 'app-trial-config',
  templateUrl: './trial-config.component.html',
  styleUrls: ['./trial-config.component.scss']
})
export class TrialConfigComponent implements OnInit {
  public trialForm: UntypedFormGroup;
  public supportUtility: TrialUtility = new TrialUtility();
  public supportDBServers: DropdownDto[];
  public supportSftpServers: DropdownDto[];

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public trialManagementService: TrialManagementService) {
  }

  ngOnInit(): void {

    this.trialForm = this.formBuilder.group({
      id: [],
      dbDriverClassName: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbServerId: [{value: AppConstant.NULL_VALUE}, Validators.required],
      sftpServerId: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbCachePrepStmts: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbPrepStmtCacheSize: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbPrepStmtCacheSqlLimit: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbConnectionTimeOut: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbIdleTimeOut: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbInitFailTimeout: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbMinIdle: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbLeakDetectionThreadshold: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbPoolSize: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbMaxLife: [{value: AppConstant.NULL_VALUE}, Validators.required],
      dbDefaultAutoCommit: [{value: AppConstant.NULL_VALUE}, Validators.required],
      userAuthType: [{value: AppConstant.NULL_VALUE}, Validators.required],
    });
    this.getActiveTrialConfigurations();
    this.getAvailableSftpServers();
  }

  public loadDBServers(dbServerId) {
    this.trialManagementService.getAvailableDBServers(dbServerId, 'A').subscribe((res: any) => {
      this.supportDBServers = res.body;
    });
  }

  getAvailableSftpServers() {
    this.trialManagementService.getAvailableSftpServers('A').subscribe((res: any) => {
      this.supportSftpServers = res.body;
      this.getAvailableDBServers(this.trialForm.get('dbDriverClassName'));
    });
  }

  getActiveTrialConfigurations() {
    this.trialManagementService.getActiveTrialConfig().subscribe((res: any) => {
        const result = res;
        result.driverClassList = this.supportUtility.driverClassList;
        result.cachePrepStmtsList = this.supportUtility.cachePrepStmtsList;
        result.authTypeList = this.supportUtility.authTypeList;
        result.dbDefaultAutoCommitList = this.supportUtility.dbDefaultAutoCommitList;
        if (result.dbDriverClassName){
          this.loadDBServers(result.dbDriverClassName);
        }
        this.trialForm.patchValue(result);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  checkEmptySpace() {
    if (this.trialForm.get('roleName').value) {
      if (this.trialForm.get('roleName').value[0] === ' ') {
        this.trialForm.get('roleName').patchValue('');
      }
    }
  }

  onSubmitForm(value: any) {
    if (this.trialForm.valid) {
      this.trialManagementService.updateTrialConfig(this.trialForm.value).subscribe((res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
            this.notificationService.successMessage(HttpResponseMessage.RECORD_UPDATED_SUCCESSFULLY);
            this.getActiveTrialConfigurations();
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    } else {
      new CommonUtility().validateForm(this.trialForm);
    }
  }

  getAvailableDBServers(e) {
    this.loadDBServers(e.value);
  }

  resetForm() {
    this.getActiveTrialConfigurations();
  }
}
