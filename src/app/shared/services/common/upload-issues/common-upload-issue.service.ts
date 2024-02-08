import { Injectable } from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root'
})
export class CommonUploadIssueService {

  public responseBody: any;
  ref: DynamicDialogRef;

  constructor(public dialogService: DialogService) {
  }
  /**
   * this method can be used to get notification dialog modal
   * @param componentName to component name
   * @param responseBody to response body
   */
  public show(componentName, responseBody) {
    this.responseBody = responseBody;
    this.ref = this.dialogService.open(componentName, {
      header: 'Upload Summary',
      width: '50%',
      contentStyle: {'max-height': '500px', overflow: 'auto'},
      baseZIndex: 10000,
      styleClass: 'style-class'
    });
  }
}
