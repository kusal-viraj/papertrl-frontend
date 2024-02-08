import {Component, OnInit} from '@angular/core';
import {CommonUploadSummaryDto} from '../../../shared/dto/common/upload-issue-mst/common-upload-summary-dto';
import {CommonUploadErrorDetailDto} from '../../../shared/dto/common/upload-issue-mst/common-upload-error-detail-dto';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {AppConstant} from '../../../shared/utility/app-constant';

@Component({
  selector: 'app-upload-notifications',
  templateUrl: './upload-notifications.component.html',
  styleUrls: ['./upload-notifications.component.scss']
})
export class UploadNotificationsComponent implements OnInit {
  public responseData: CommonUploadSummaryDto = new CommonUploadSummaryDto();

  constructor(public commonUploadIssueService: CommonUploadIssueService) {
    this.responseData = this.commonUploadIssueService.responseBody;
  }

  ngOnInit(): void {
  }


  getErrors(error: CommonUploadErrorDetailDto) {

    if (error.lineNo === undefined || error.lineNo === null) {
      return error.description;
    } else {
      return 'Line Number:' + error.lineNo + AppConstant.EMPTY_SPACE + error.description;
    }

  }

}
