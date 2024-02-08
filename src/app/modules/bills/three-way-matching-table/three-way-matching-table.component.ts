import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';

@Component({
  selector: 'app-three-way-matching-table',
  templateUrl: './three-way-matching-table.component.html',
  styleUrls: ['./three-way-matching-table.component.scss']
})
export class ThreeWayMatchingTableComponent implements OnInit {
  @Input() matchingTableValues: any [];
  @Input() isViewMatchingTable = false;
  @Input() poNumber: any;
  @Output() public closeDrawer = new EventEmitter();
  public appConstant: AppConstant = new AppConstant();

  constructor() {
  }

  ngOnInit(): void {
  }

}
