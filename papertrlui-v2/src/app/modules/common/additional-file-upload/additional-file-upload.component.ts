import {Component, Input, OnInit} from '@angular/core';
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: '[app-additional-file-upload]',
  templateUrl: './additional-file-upload.component.html',
  styleUrls: ['./additional-file-upload.component.scss']
})
export class AdditionalFileUploadComponent implements OnInit {

  public commonUtil = new CommonUtility();
  @Input() additionalFieldProperties: any;
  @Input() additionalField: any;
  @Input() showClear = true
  @Input() form: any;
  @Input() index: any;
  @Input() header = false;

  public randomId: any

  constructor() {
  }

  ngOnInit(): void {
    this.randomId = '_' + Math.random().toString(36).substr(2, 9);
  }





}
