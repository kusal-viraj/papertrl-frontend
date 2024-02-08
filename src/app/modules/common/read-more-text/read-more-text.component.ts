import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: '[app-read-more-text]',
  templateUrl: './read-more-text.component.html',
  styleUrls: ['./read-more-text.component.scss']
})
export class ReadMoreTextComponent implements OnInit {
  @Input() fieldValue: any;
  @Input() maxCharacters: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  characterCount(fieldValue: any) {
    let returnVal = 0;
    if (fieldValue === null || fieldValue === undefined) {
      return returnVal;
    }
    fieldValue = fieldValue + '';
    try {
      returnVal = fieldValue.length;
    } catch (e) {
      returnVal = fieldValue.length;
    }
    return returnVal;
  }
}
