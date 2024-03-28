import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {ItemService} from '../../../../shared/services/items/item.service';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {ConfirmationService} from 'primeng/api';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-vendor-item-detail',
  templateUrl: './vendor-item-detail.component.html',
  styleUrls: ['./vendor-item-detail.component.scss']
})
export class VendorItemDetailComponent implements OnInit {
  @Input() responseData: any = {};
  @Input() vendorId: any;
  @Input() itemTypeId: any;
  @Output() emptyItemList = new EventEmitter();
  @Output() emptyRemainingList = new EventEmitter();
  @Output() closeDrawer = new EventEmitter();

  public tableSupportBase = new TableSupportBase();
  public appConstant = new AppConstant();
  public itemList: DropdownDto = new DropdownDto();
  public selectedVendorItems: any [] = [];
  public exitVendorItems: any [] = [];

  selectedOption = AppConstant.ONE;
  public isSelectedVendorPartNumber = true;
  public isSelectedRandomItemNumber = false;
  public isSelectedExistingItemNumber = false;
  public isLoadingUpdateProgress = false;
  public inInvalidItemSelection = false;
  public addNewItemOverlay = false;
  public isSelectedItem = false;
  public value: any;
  public previousSelectionId: number;
  public isDisabled = false;
  public mappingOptionSelectionForm: FormGroup;
  tempObject: any;
  public isAccepted = false;
  public isViewErrorContent = false;
  public response: any;


  constructor(public itemService: ItemService, public notificationService: NotificationService,
              public formBuilder: FormBuilder,
              public privilegeService: PrivilegeService, public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.tempObject = JSON.stringify(this.responseData);
    this.previousSelectionId = AppConstant.ONE;
    this.getVendorItemList(this.vendorId);
    this.mappingOptionSelectionForm = this.formBuilder.group({
      optionId: [1]
    });
  }


  /**
   * Handles the change event when the option is selected.
   * Updates the corresponding boolean flags based on the selected option.
   */

  onOptionChange(event) {
    if ((this.previousSelectionId === 3 && this.isSelectedItem && event !== 3 && !this.isAccepted)) {
      this.confirmAndNavigate(this.mappingOptionSelectionForm.get('optionId').value);
      return;
    } else {
      this.proceedSelection(this.mappingOptionSelectionForm.get('optionId').value);
    }
    this.previousSelectionId = event;
  }

  /**
   * this method updated selection option value
   * @param event to selection option id
   */
  proceedSelection(event) {
    switch (event) {
      case 1:
        this.isSelectedVendorPartNumber = true;
        this.isSelectedRandomItemNumber = false;
        this.isSelectedExistingItemNumber = false;
        break;
      case 2:
        this.isSelectedRandomItemNumber = true;
        this.isSelectedVendorPartNumber = false;
        this.isSelectedExistingItemNumber = false;
        break;
      case 3:
        this.isSelectedExistingItemNumber = true;
        this.isSelectedVendorPartNumber = false;
        this.isSelectedRandomItemNumber = false;
        break;
      default:
        // Handle default case
        break;
    }
  }

  /**
   * this method get confirmation of selection change
   * @param selectedId to selectedId
   */
  confirmAndNavigate(selectedId) {
    this.confirmationService.confirm({
      message: 'Please note that any unsaved changes will be lost if you change mapping options.',
      key: 'changeOption',
      accept: () => {
        this.selectedVendorItems = []; // Clear the selected vendor items
        this.responseData = JSON.parse(this.tempObject);
        this.isAccepted = true;
        this.proceedSelection(selectedId);
      },
      reject: () => {
        this.mappingOptionSelectionForm.get('optionId').patchValue(3);
        return;
      }
    });
  }


  /**
   *  Retrieves a list of items from the item service.
   *  Updates the itemList data with the retrieved items.
   *  Handles any errors that occur during the API call.
   */
  getVendorItemList(selectedVendorId) {
    if (!selectedVendorId) {
      return;
    }
    this.itemService.getItemListByVendorId(selectedVendorId, true).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.itemList.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_CREATE)) {
          this.itemList.addNew();
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * close the mapping screen
   */
  cancel() {
    if (this.responseData.itemVendorWiseList.length > AppConstant.ZERO) {
      this.confirmationService.confirm({
        message: 'Please note that any unsaved changes will be lost if you close this page without saving.',
        key: 'drawerKey',
        accept: () => {
          this.responseData = null;
          this.emptyRemainingList.emit(this.responseData);
          this.emptyItemList.emit();
        },
        reject: () => {
        }
      });
    } else {
      this.emptyItemList.emit();
    }
  }

  /**
   * Maps the selected items.
   */
  mappingSelectedItemList() {
    this.isLoadingUpdateProgress = true;
    if (this.selectedVendorItems?.length === AppConstant.ZERO) {
      this.notificationService.infoMessage(HttpResponseMessage.VENDOR_ITEM_SELECTION_IS_INVALID);
      this.isLoadingUpdateProgress = false;
      return;
    }
    if (this.isSelectedExistingItemNumber) {
      const invalidRecords = new Array<any>();
      for (let i = AppConstant.ZERO; i < this.selectedVendorItems.length; i++) {
        if (!this.selectedVendorItems[i].itemMstId) {
          this.selectedVendorItems[i].isInvalid = true;
          invalidRecords.push(this.selectedVendorItems[i]);
        } else {
          this.selectedVendorItems[i].isInvalid = false;
        }
      }
      if (invalidRecords.length > AppConstant.ZERO) {
        this.inInvalidItemSelection = true;
        this.isLoadingUpdateProgress = false;
        return;
      }
    }
    this.inInvalidItemSelection = false;
    const requestItemDetail: any = {};
    requestItemDetail.optionId = this.mappingOptionSelectionForm.get('optionId').value;
    requestItemDetail.vendorId = this.vendorId;
    requestItemDetail.itemTypeId = this.itemTypeId;
    requestItemDetail.itemVendorWiseList = this.selectedVendorItems;
    this.itemService.mapItem(requestItemDetail).subscribe(
      (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.itemService.successfullyMappedVendorItem.next(true);
          if (res.body?.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.isViewErrorContent = true;
            this.response = res.body;
            this.selectedVendorItems = this.selectedVendorItems.filter(obj => !this.response.namesList.includes(obj.vendorItemNumber));
            this.exitVendorItems = this.selectedVendorItems.filter(obj => this.response.namesList.includes(obj.vendorItemNumber));
            this.isLoadingUpdateProgress = false;
          } else {
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_ITEM_MAPPED_SUCCESSFULLY);
          }
          if (this.selectedVendorItems.length === AppConstant.ZERO) {
            this.selectedVendorItems = this.exitVendorItems;
            this.tempObject.itemVendorWiseList = this.selectedVendorItems;
          }
          this.removeSelectedItem();
        } else {
          this.isLoadingUpdateProgress = false;
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error => {
        this.isLoadingUpdateProgress = false;
        this.notificationService.errorMessage(error);
      }
    );
  }

  /**
   * This method is used to highlight invalid fields.
   */
  validateItemNumber(item) {
    if (this.selectedVendorItems.length > AppConstant.ZERO) {
      const selectedItemIndex = this.selectedVendorItems.findIndex(selectedItem => selectedItem.id === item.id);
      const selectedVendorItem = this.selectedVendorItems[selectedItemIndex];
      if (selectedVendorItem && !selectedVendorItem.itemMstId && selectedVendorItem.id === item.id) {
        item.isInvalid = true;
        item.itemMstId = null;
        return;
      }
    }
    if (item.isInvalid && item.itemMstId) {
      item.isInvalid = false;
      return;
    }
    if (!item.itemMstId && item.isInvalid) {
      item.isInvalid = false;
      return;
    }
  }

  /**
   * This method is used to change item list
   * @param event to change event
   * @param item to selected object in the table
   * @param dpNameProductId to dropdown reference
   */
  changeItemList(event, item, dpNameProductId) {
    this.isSelectedItem = true;
    this.isAccepted = false;
    if (event.value === AppConstant.ZERO) {
      this.addNewItemOverlay = true;
      item.itemMstId = null;
      dpNameProductId.selectedOption = null;
      dpNameProductId.showClear = false;
      return;
    } else {
      dpNameProductId.showClear = true;
    }
    this.validateItemNumber(item);
  }

  /**
   * This method is used to removed selected Item
   */
  removeSelectedItem() {
    this.responseData.itemVendorWiseList = this.responseData.itemVendorWiseList.filter(item1 => !this.selectedVendorItems.some(item2 => item2.id === item1.id));
    this.tempObject = JSON.stringify(this.responseData);
    if (this.responseData?.itemVendorWiseList.length === AppConstant.ZERO) {
      this.emptyItemList.emit();
      this.responseData = null;
      this.emptyRemainingList.emit(this.responseData);
    }
    this.selectedVendorItems = [];
    this.isLoadingUpdateProgress = false;
  }
}
