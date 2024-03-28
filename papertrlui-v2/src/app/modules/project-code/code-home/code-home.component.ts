import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {UploadProjectCodeComponent} from '../upload-project-code/upload-project-code.component';
import {ProjectCodeListComponent} from '../project-code-list/project-code-list.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-code-home',
  templateUrl: './code-home.component.html',
  styleUrls: ['./code-home.component.scss']
})
export class CodeHomeComponent implements OnInit, OnDestroy {
  public createProjectCode = false;
  public uploadProjectCode = false;
  public appAuthorities = AppAuthorities;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  @ViewChild('projectCodeListComponent') public projectCodeListComponent: ProjectCodeListComponent;
  @ViewChild('uploadProjectCodeComponent') public uploadProjectCodeComponent: UploadProjectCodeComponent;


  constructor(public privilegeService: PrivilegeService, public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
  }

  /**
   * Toggle Project Code Views
   * @param value button id
   */
  toggleProjectCode(value: string) {
      if (value === 'pc') {
        this.createProjectCode = true;
        this.uploadProjectCode = false;
      } else if (value === 'pu') {
        this.createProjectCode = false;
        this.uploadProjectCode = true;
      }
  }

  ngOnDestroy(): void {
  }
}
