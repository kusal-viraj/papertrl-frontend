import {CommonUploadErrorDetailDto} from './common-upload-error-detail-dto';
export class CommonUploadSummaryDto {
 public importMstId: number;
 public totalRecords: number;
 public scceeded: number;
 public failed: number;
 public errors: CommonUploadErrorDetailDto [] = [];
}
