import {Component, Input, OnInit} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';


@Component({
  selector: 'app-accounting-home',
  templateUrl: './accounting-home.component.html',
  styleUrls: ['./accounting-home.component.scss']
})
export class AccountingHomeComponent implements OnInit {

  @Input() public isDc = false; // Is the System QB
  @Input() public statusOfSystemButton: boolean; // Status of QB Sync
  @Input() public systemId: any; // Id of QB Sync
  @Input() public systemName: any; // Name of the System
  @Input() public authTypeId: any; // Auth Type Id

  public configurationViewQb = false; // Configurations QB Side Drawer
  public configurationViewQBb = false; // Configurations bb Side Drawer
  public configurationViewDno = false; // Configurations DNO Side Drawer
  public configurationViewBc = false; // Configurations BC Side Drawer
  public configurationViewBcc = false; // Configurations BCC Side Drawer
  public connectionTrigger; // Triggers when Configuration Button Clicked

  constructor() {
  }

  ngOnInit(): void {
  }

  configurations() {
    if (this.systemId === AppConstant.SYSTEM_QUCIK_BOOKS_ONLINE){
      this.configurationViewQb = true;
      this.connectionTrigger = 'QB';
    }
    if (this.systemId === AppConstant.SYSTEM_BUISNESS_CENTRAL_V15){
      this.configurationViewBc = true;
      this.connectionTrigger = 'BC';
    }
    if (this.systemId==AppConstant.SYSTEM_BUISNESS_CENTRAL_CLOUD){
      this.configurationViewBcc = true;
      this.connectionTrigger = 'BCC';
    }
    if (this.systemId === AppConstant.SYSTEM_BLACKBAUD){
      this.configurationViewQBb = true;
      this.connectionTrigger = 'BB';
    }
    if (this.systemId === AppConstant.SYSTEM_DNO){
      this.configurationViewDno = true;
      this.connectionTrigger = 'DNO';
    }
  }
}
