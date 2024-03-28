import {Component, Input, OnInit} from '@angular/core';
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AccountService} from "../../../shared/services/accounts/account.service";

@Component({
  selector: 'app-table-account-overlay',
  templateUrl: './table-account-overlay.component.html',
  styleUrls: ['./table-account-overlay.component.scss']
})
export class TableAccountOverlayComponent implements OnInit {

  public commonUtil = new CommonUtility();
  public accountDto: any;

  @Input() accountId: number;

  constructor(public accountService: AccountService) {
  }

  ngOnInit(): void {
    if (!this.accountId) {
      return;
    } else {
      this.accountService.getAccountPopupData(this.accountId).subscribe((res) => {
        this.accountDto = res.body;
      });
    }
  }

}
