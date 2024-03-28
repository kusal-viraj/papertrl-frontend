import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {ItemService} from "../../../shared/services/items/item.service";
import {CreditCardUploadedListComponent} from "../../expense/credit-card-uploaded-list/credit-card-uploaded-list.component";
import {ItemListComponent} from "../item-list/item-list.component";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

export class ItemState {
  itemCreate?: any;
  itemUpload?: any;
  listItem?: any;
}

@Component({
  selector: 'app-item-home',
  templateUrl: './item-home.component.html',
  styleUrls: ['./item-home.component.scss']
})
export class ItemHomeComponent implements OnInit, OnDestroy {
  public isViewCreateItemContent = false;
  public isViewUploadItemContent = false;
  public isViewListItemContent = false;
  public tabIndex: any;
  public appAuthorities = AppAuthorities;
  public state: ItemState = new ItemState();
  public AppAnalyticsConstants = AppAnalyticsConstants;

  @ViewChild('itemListComponent') public itemListComponent: ItemListComponent;


  constructor(public privilegeService: PrivilegeService, public formGuardService: FormGuardService, public itemService: ItemService) {
  }

  ngOnInit(): void {
    this.isViewListItemContent = true;
    if (sessionStorage.getItem('itemState')) {
      this.state = JSON.parse(sessionStorage.getItem('itemState'));
      this.isViewCreateItemContent = this.state.itemCreate;
      this.isViewUploadItemContent = this.state.itemUpload;
      this.isViewListItemContent = this.state.listItem;
    }
  }

  /**
   * Destroys the ItemState on Session Storage
   */
  ngOnDestroy() {
    sessionStorage.removeItem('itemState');
  }

  /**
   * Store Actions on Session Storage
   */
  storeSessionStore() {
    this.state.itemCreate = this.isViewCreateItemContent;
    this.state.itemUpload = this.isViewUploadItemContent;
    this.state.listItem = this.isViewListItemContent;
    sessionStorage.setItem('itemState', JSON.stringify(this.state));
  }

  /**
   * Toggle Views
   * @param val button name
   */
  toggleCreateUser(val) {
    if (val === 'cu') {
      this.isViewCreateItemContent = true;
      this.isViewUploadItemContent = false;
      this.isViewListItemContent = false;

    } else if (val === 'vl') {
      this.isViewUploadItemContent = false;
      this.isViewCreateItemContent = false;
      this.isViewListItemContent = true;

    } else if (val === 'ul') {
      this.isViewUploadItemContent = true;
      this.isViewCreateItemContent = false;
      this.isViewListItemContent = false;
    }
    this.storeSessionStore();
  }

  /**
   * this method can be used to get visible content
   */
  getTabAfterSuccess(event) {
    if (event !== undefined) {
      this.tabIndex = event.tabIndex;
      this.isViewListItemContent = event.visible;
      this.isViewCreateItemContent = false;
      this.refreshTableData();
    }
  }

  isTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.ITEMS_DETAIL_VIEW, AppAuthorities.ITEMS_EDIT,
      AppAuthorities.ITEMS_ACTIVATE, AppAuthorities.ITEMS_INACTIVATE, AppAuthorities.ITEMS_DELETE]);
  }

  /**
   * Refresh account table data from another component
   */
  refreshTableData() {
    this.itemService.updateTableData.next(true);
  }
}
