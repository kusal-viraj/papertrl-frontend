import {Component, Input, OnInit} from '@angular/core';
import {
  CommonUploadErrorDetailDto
} from '../../../../shared/dto/common/upload-issue-mst/common-upload-error-detail-dto';
import {AppConstant} from '../../../../shared/utility/app-constant';

@Component({
  selector: 'app-vendor-item-error',
  templateUrl: './vendor-item-error.component.html',
  styleUrls: ['./vendor-item-error.component.scss']
})
export class VendorItemErrorComponent implements OnInit {
  @Input() responseData: any;
  @Input() fromMappingScreen = false;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * this method can be used to get errors
   * @param error to single error
   */
  getErrors(error: CommonUploadErrorDetailDto) {
    if (error.lineNo === undefined || error.lineNo === null) {
      return error.description;
    } else {
      return 'Line Number:' + error.lineNo + AppConstant.EMPTY_SPACE + error.description;
    }
  }

}
