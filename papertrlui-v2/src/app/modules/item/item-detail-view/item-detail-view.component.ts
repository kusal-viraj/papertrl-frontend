import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ItemService} from '../../../shared/services/items/item.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {CommonItemDetails} from '../../../shared/dto/item/common-item-details';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-item-detail-view',
  templateUrl: './item-detail-view.component.html',
  styleUrls: ['./item-detail-view.component.scss']
})
export class ItemDetailViewComponent implements OnInit {

  @Input() itemId;
  @Input() fromReport = false;
  @Input() itemStatus: any;
  @Output() closeEditView = new EventEmitter();
  @Output() successDelete = new EventEmitter();
  public commonUtil = new CommonUtility();
  public appAuthorities = AppAuthorities;
  public clickIndex: any;
  public isEditView = false;

  public vendorItemDetails: CommonItemDetails [] = [];
  public commonVendorItemDetail: CommonItemDetails = new CommonItemDetails();

  public itemDetailViewForm: UntypedFormGroup;
  public imageUrl: any;

  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.itemDetailViewForm = this.formBuilder.group({
      incomeAccountNumber: [null],
      expenseAccountNumber: [null],
      inventoryAssetAccountNumber: [null],
      uomUnit: [null],
      itemType: [null],
      itemNumber: [null],
      name: [null],
      itemCategory: [null],
      parentItemName: [null],
      salesPrice: [null],
      salesDescription: [null],
      purchaseDescription: [null],
      buyingPrice: [null],
      taxableStr:[null],
      commonItemDetails: this.formBuilder.array([]),
    });
    this.getItemDetail(this.itemId);
  }

  get f() {
    return this.itemDetailViewForm.controls;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get commonItemDetails() {
    return this.itemDetailViewForm.get('commonItemDetails') as UntypedFormArray;
  }

  /**
   * This method generate form builder for form array data
   */
  generateVendorItemFormBuilder() {
    const vendorItemInformation = this.formBuilder.group({
      id: [null],
      vendorItemImage: [null],
      vendorId: [null],
      vendorItemNumber: [null],
      vendorItemDescription: [null],
      vendorItemPrice: [null],
      leadTime: [null],
      minOrderQty: [null],
      vendorName: [null],
      vendorItemImageUrl: [null],
      status: [null],
      lineNo: [null],
      statusString: [null],
      isProgressItemView:[false],
    });
    this.commonItemDetails.push(vendorItemInformation);
  }

  /**
   * this method can be used to get item details
   */
  getItemDetail(itemId) {
    this.itemService.getItemDetails(itemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.addLineData(res);
        this.downloadItemImage();
        this.itemDetailViewForm.patchValue(res.body);

      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    })
  }

  /**
   * this method can be used to add line data items to current view
   * @param res to response data
   */
  addLineData(res) {
    this.commonItemDetails.controls = [];
    if(!res.body.commonItemDetails){
      return;
    }else {
      for (let i = 0; i < res.body.commonItemDetails.length; i++) {
        this.generateVendorItemFormBuilder();
      }
    }
  }

  /**
   * this method can be used to download item image
   */
  downloadItemImage() {
    this.itemService.downloadItemImage(this.itemId).subscribe((res: any) => {
        this.createImageFromBlob(res);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Convert the Response Blob image to Image
   * @param image Blob to blob file
   */
  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageUrl = reader.result;
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
    }
  }

  /**
   * this method can be used to download item image
   */
  viewVendorItemImage(lineItemId, vendorItemNumber, i) {
    this.clickIndex = i;
    this.commonVendorItemDetail.vendorItemImageUrl = null;
    this.commonItemDetails.value[i].isProgressItemView = true;
    this.itemService.downloadVendorItemImage(lineItemId).subscribe((res: any) => {
        this.createVendorItemImageFromBlob(res, this.clickIndex);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Convert the Response Blob image to Image
   * @param image Blob to blob file
   */
  createVendorItemImageFromBlob(image: Blob, i) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.commonVendorItemDetail.vendorItemImageUrl = reader.result;
      setTimeout(() => {
      }, 2000)
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
      this.commonItemDetails.value[i].isProgressItemView = false;
    }
  }

  /**
   * this method can be used to delete item
   */
  /**
   * deleteExpense item
   */
  deleteItem() {
    this.confirmationService.confirm({
      key: 'itemDeleteDetailView',
      message: 'You want to delete this Item <br><br> ' +
        'If you perform this action, any associated items will be deleted as well',
      accept: () => {
        this.itemService.deleteItem(this.itemId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ITEM_DELETED_SUCCESSFULLY);
            this.isEditView = false;
            this.closeEditView.emit();
            this.successDelete.emit();
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * this method can be used to edit item
   */
  editItem() {
    this.isEditView = true;
    this.notificationService.clear();
  }
}
