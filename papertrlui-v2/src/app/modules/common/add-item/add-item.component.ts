import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ItemMasterDto} from '../../../shared/dto/item/item-master-dto';
import {ItemTypeDto} from '../../../shared/dto/item/item-type-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {ItemUtility} from '../../item/item-utility';
import {AccountUtility} from '../../account/account-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {ItemService} from '../../../shared/services/items/item.service';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {CategoryMstDto} from '../../../shared/dto/item/category-mst-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {OverlayPanel} from 'primeng/overlaypanel';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {CommonMessage} from '../../../shared/utility/common-message';
import {CommonItemDetails} from '../../../shared/dto/item/common-item-details';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  public createItemForm: UntypedFormGroup;
  public itemMstDto: ItemMasterDto = new ItemMasterDto();
  public itemTypeId: ItemTypeDto = new ItemTypeDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public itemUtility: ItemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);


  public addNewUOM = false;
  public addNewCategory = false;
  public addNewAccount = false;
  public addNewVendor = false;
  public addVendorPanel: boolean;
  public updateImage = false;
  public isSelectedItemTypeAsInventory = false;
  public viewPurchaseInformation = false;
  public value: any;
  public expenseAccount: any;
  public isLoadingCreateProgress = false;
  public isLoadingUPateProgress = false;
  public imageUrl: any;
  public vendorItemImageUrl: any;
  public imageChanged: boolean;
  public viewOnly = false;
  public clickIndex: any;
  public image: File;

  @Input() panel: boolean;
  @Input() itemID: any;
  @Input() detailView = false;
  @Input() editView: boolean;
  @Output() emittedTabIndex = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  @Output() closeEditView = new EventEmitter();
  @ViewChild('op') op: OverlayPanel;
  @Input() vendorId: any;
  public vendorAccount = new DropdownDto();

  public parentItems: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public vendorItemDetails: CommonItemDetails [] = [];
  public commonVendorItemDetail: CommonItemDetails = new CommonItemDetails();
  public chartOfAccounts = new DropdownDto();


  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService,
              public cd: ChangeDetectorRef, public privilegeService: PrivilegeService, public billsService: BillsService,
              public messageService: MessageService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.viewPurchaseInformation = true;
    this.getItemData();
    this.viewOnly = false;
    this.createItemForm = this.formBuilder.group({
      itemTypeId: [{value: null, disabled: this.detailView}, Validators.required],
      itemNumber: [{
        value: null,
        disabled: this.detailView
      }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      name: [{value: null, disabled: this.detailView}],
      uomId: [{value: null, disabled: this.detailView}],
      taxable: [{value: false, disabled: this.detailView}],
      parentId: [{value: null, disabled: this.detailView}],
      itemCategoryId: [{value: null, disabled: this.detailView}],
      buyingPrice: [{value: null, disabled: this.detailView}],
      purchaseDescription: [{value: null, disabled: this.detailView}],
      expenseAccount: [{value: null, disabled: this.detailView}, Validators.required],
      salesPrice: [{value: null, disabled: this.detailView}],
      salesDescription: [{value: null, disabled: this.detailView}],
      incomeAccount: [{value: null, disabled: this.detailView}],
      inventoryAssetAccount: [{value: null, disabled: this.detailView}],
      vendorId: [{value: null, disabled: this.detailView}],
      id: [],
      itemImage: [],
      img: [],
      updateImage: [false],
      partnerService: [false],
      commonItemDetails: this.formBuilder.array([]),
    });
    if (!this.detailView) {
      for (let i = 0; i < 5; i++) {
        this.generateVendorItemFormBuilder();
      }
    }
    this.validateExpenseAccountController();
    this.patchVendorId();
    this.getVendorList();
    this.getAccounts();

  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorAccount.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_CREATE)) {
          this.vendorAccount.addNew();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
  /**
   * this method can be used to patch vendor id to first line of the purchasing info table
   */
  patchVendorId(){
    if(!this.vendorId){
      return
    }else {
      this.commonItemDetails.controls[AppConstant.ZERO].get('vendorId').patchValue(this.vendorId);
    }
  }



  /**
   * -----------------------------------------------Upload Image-------------------------------------------------->
   */


  /**
   * Delete Image
   */
  deleteFile() {
    this.image = null;
    this.imageUrl = null;
    this.createItemForm.get('updateImage').patchValue(true);
    this.createItemForm.get('itemImage').reset();
  }

  /**
   * this method can be used to upload image
   * @param event to change event
   * @param fileInput to file input reference
   */
  uploadFile(event, fileInput) {
    if (this.itemUtility.isValidFile(event, fileInput)) {
      this.imageChanged = true;
      const reader = new FileReader();
      const file = event.target.files[0];
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        this.createItemForm.patchValue({
          itemImage: targetFile
        });
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
      }
    }
  }


  /**
   * this method can be used to download item image
   */
  downloadItemImage() {
    this.itemService.downloadItemImage(this.itemID).subscribe((res: any) => {
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
   * ---------------------------------------------------------------------------------------------------------------------->
   */


  /**
   * This method used to get item data
   */
  getItemData() {
    if (this.editView || this.detailView) {
      this.viewOnly = true;
      this.itemService.getItemDetails(this.itemID).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.addLineData(res);
          if (res.body.itemTypeId) {
            this.itemService.getParentItem(res.body.id, res.body.itemTypeId.id).subscribe((res1: any) => {
              this.parentItems.data = (res1);
            });
          }
          this.isOnSwitch(res.body);
          this.validateAssetAccountController(res.body.itemTypeId.id)
          setTimeout(() => {
            this.createItemForm.get('itemTypeId').patchValue(res.body.itemTypeId.id);
          }, 100);
          this.downloadItemImage();

        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to add line data items to current view
   * @param res to response data
   */
  addLineData(res) {
    this.commonItemDetails.controls = [];
    if (!this.detailView) {
      for (let i = 0; i < 5; i++) {
        this.generateVendorItemFormBuilder();
      }
    } else {
      for (let i = 0; i < res.body.commonItemDetails.length; i++) {
        this.generateVendorItemFormBuilder();
      }
    }
    this.expenseAccount = res.body.expenseAccount;
    this.vendorItemDetails = res.body.commonItemDetails;
    this.createItemForm.patchValue(res.body);
  }


  /**
   * this method used to is on the switch
   */
  isOnSwitch(responseData) {
    const commonItemDetails: any [] = responseData.commonItemDetails;
    const expenseAccount = responseData.expenseAccount;
    this.viewPurchaseInformation = (commonItemDetails ? commonItemDetails.length > AppConstant.ZERO : false)
      || (expenseAccount !== null && expenseAccount != undefined);
    this.validateExpenseAccountController();
  }

  /**
   * This method can be used to create item
   * @param createItemForm to form group instance
   */
  submitItem(createItemForm) {
    if (this.createItemForm.valid) {
      this.itemMstDto.itemTypeId.id = createItemForm.itemTypeId;
      this.itemMstDto = createItemForm;
      this.createItem(this.itemMstDto);
    } else {
      new CommonUtility().validateForm(this.createItemForm);
    }
  }

  /**
   * Show Purchase information fields
   * @param event
   */
  showPurchaseInformation(event) {
    this.viewPurchaseInformation = event.checked;
    this.createItemForm.get('partnerService').patchValue(event.checked);
    this.commonItemDetails.controls = [];
    if (!this.detailView) {
      for (let i = 0; i < 5; i++) {
        this.generateVendorItemFormBuilder();
      }
    }
    if (this.editView) {
      this.createItemForm.get('expenseAccount').patchValue(this.expenseAccount);
      this.createItemForm.get('commonItemDetails').patchValue(this.vendorItemDetails);
    }
    this.validateExpenseAccountController();
  }

  /**
   * This method used to reset item form
   */
  resetItemForm() {
    if (!this.editView) {
      this.commonItemDetails.controls = [];
      for (let i = 0; i < 5; i++) {
        this.generateVendorItemFormBuilder();
      }
      this.createItemForm.reset();
      this.deleteFile();
    } else {
      this.getItemData();
    }
  }

  /**
   * This method trigger when change uom list
   */
  changeList(formControlName, id) {
    if (id.value != null) {
      switch (formControlName) {
        case 'uomId': {
          if (id.value === 0) {
            this.addNewUOM = true;
            this.addNewCategory = false;
            this.addNewAccount = false;
            this.addNewVendor = false;
            setTimeout(() => {
              this.createItemForm.controls.uomId.reset();
            });
          }
          break;
        }
        case 'itemCategoryId': {
          if (id.value === 0) {
            this.addNewUOM = false;
            this.addNewCategory = true;
            this.addNewAccount = false;
            this.addNewVendor = false;
            setTimeout(() => {
              this.createItemForm.controls.itemCategoryId.reset();
            });
          }
          break;
        }
        case 'inventoryAssetAccount': {
          if (id.value === 0) {
            this.addNewUOM = false;
            this.addNewCategory = false;
            this.addNewAccount = true;
            this.addNewVendor = false;
            setTimeout(() => {
              this.createItemForm.controls.inventoryAssetAccount.reset();
            });
          }
          break;
        }
        case 'incomeAccount': {
          if (id.value === 0) {
            this.addNewUOM = false;
            this.addNewCategory = false;
            this.addNewAccount = true;
            this.addNewVendor = false;
            setTimeout(() => {
              this.createItemForm.controls.incomeAccount.reset();
            });
          }
          break;
        }
        case 'expenseAccount': {
          if (id.value === 0) {
            this.addNewUOM = false;
            this.addNewCategory = false;
            this.addNewAccount = true;
            this.addNewVendor = false;
            setTimeout(() => {
              this.createItemForm.controls.expenseAccount.reset();
            });
          }
          break;
        }
        case 'vendorId': {
          if (id.value === 0) {
            this.addNewUOM = false;
            this.addNewCategory = false;
            this.addNewAccount = false;
            this.addNewVendor = true;
            setTimeout(() => {
              this.createItemForm.controls.vendorId.reset();
            });
          }
          break;
        }
      }
    }
  }

  /**
   * This method use to get vendor
   * @param event to change event
   * @param i to table row index
   */
  changedVendorSelection(event: any, i) {
    if (event.value === 0) {
      this.addVendorPanel = true;
      this.commonItemDetails.controls[i].get('vendorId').reset();
    }
  }

  /**
   * This method use to get account
   * @param id change event
   */
  changedAccountSelection(id) {
    this.value = id;
    if (id.value === 0) {
      this.addNewAccount = true;
      this.createItemForm.get('expenseAccount').reset();
    }
  }

  /**
   * this method used to create item
   */
  createItem(itemDto) {
    itemDto.id ? this.createItemForm.get('id').patchValue(itemDto.id) : this.createItemForm.get('id').reset();
    const itemTypeId: ItemTypeDto = new ItemTypeDto();
    const categoryMstDto: CategoryMstDto = new CategoryMstDto();
    if (this.createItemForm.get('itemTypeId').value !== undefined || this.createItemForm.get('itemTypeId').value != null) {
      categoryMstDto.id = this.createItemForm.get('itemCategoryId').value;
      itemDto.category = categoryMstDto;
    }
    itemTypeId.id = this.createItemForm.get('itemTypeId').value;
    itemDto.itemTypeId = itemTypeId;
    this.isLoadingCreateProgress = true;
    this.isLoadingUPateProgress = true;
    if(this.expenseAccount){
      itemDto.expenseAccount = this.expenseAccount;
    }
    this.itemService.createItem(itemDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (!itemDto.id) {
          this.notificationService.successMessage(HttpResponseMessage.ITEM_CREATED_SUCCESSFULLY);
          this.isLoadingCreateProgress = false;
          this.resetItemForm();
          setTimeout(() => {
            this.emittedTabIndex.emit({tabIndex: 0, visible: true});
          }, 1000);

        } else if (itemDto.id) {
          this.notificationService.successMessage(HttpResponseMessage.ITEM_UPDATED_SUCCESSFULLY);
          this.isLoadingUPateProgress = false;
          this.refreshTable.emit('ITEM_UPDATED');
        }
      } else {
        this.isLoadingCreateProgress = false;
        this.isLoadingUPateProgress = false;
        this.notificationService.infoMessage(res.body.message);

      }
    }, error => {
      this.isLoadingUPateProgress = false;
      this.isLoadingCreateProgress = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * item type change
   */
  itemTypeChange(id) {
    if (id.value != null) {
      const itemId = this.createItemForm.get('id').value;
      this.itemService.getParentItem(itemId ? itemId : 0, id.value).subscribe((res: any) => {
        this.parentItems.data = (res);
      });
    }
    this.validateAssetAccountController(id.value);
  }

  /**
   * this method can be used to get updated Uonms
   * @param event to dropdown reference
   */

  getEmittedUoms(event) {
    if (event != null || event !== undefined) {
      this.itemUtility.uoms = event;
    }
  }

  /**
   * this method can be used to get update category
   * @param event to emitted values
   */
  getUpdatedCategories(event) {
    if (event != null || event !== undefined) {
      this.itemUtility.category = event;
    }
  }

  /**
   * this method can be used to get update accounts
   * @param event to emitted values
   */
  getUpdatedAccounts(event) {
    if (event != null || event !== undefined) {
      this.getAccounts();
    }
  }

  /**
   * get income accounts / expense account / asset account
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   */
  getAccounts(){
    this.billsService.getAccountList(!this.editView).subscribe((res: any) => {
      this.chartOfAccounts.data = (res);
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        this.chartOfAccounts.addNew();
      }
    }, error => {
      this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: error});
    });
  }

  isFieldHasValue(field) {
    if (this.createItemForm.get(field).value === false) {
      return false;
    } else {
      return this.createItemForm.get(field).value !== null
    }
  }

  /**
   * vendor item form modifications--------------------------------------------------------------------------------->
   */


  /**
   * this method can be used to validate expense account
   */
  validateExpenseAccountController() {
    const expenseAccount = this.createItemForm.get(AppConstant.EXPENSE_ACCOUNT_CONTROLLER);
    if (this.viewPurchaseInformation) {
      expenseAccount.setValidators(Validators.required);
    } else {
      expenseAccount.clearValidators();
      expenseAccount.reset();
      expenseAccount.updateValueAndValidity();
    }
    expenseAccount.updateValueAndValidity();
  }


  /**
   * This method can use for get controllers in form array
   */
  public get commonItemDetails() {
    return this.createItemForm.get('commonItemDetails') as UntypedFormArray;
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
      vendorItemImageUrl: [null],
      status: [null]
    });
    this.commonItemDetails.push(vendorItemInformation);
  }


  /**
   * this method trigger when change ths vendor item image
   * @param event to event to change event
   * @param i to event to change event
   * @param file to file reference
   */
  changeVendorItemImage(event, i, file) {
    if (this.itemUtility.isValidFile(event, file)) {
      const targetFile = event.target.files[0];
      this.commonItemDetails.controls[i].patchValue({
        vendorItemImage: targetFile
      });
    }
  }

  /**
   * validate item image
   * @param file to file
   */
  validateAttachment(file) {
    if ((file.size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
      return false;
    } else {
      return true;
    }
  }

  /**
   * this method can be used to trigger click event for special row file input
   * @param itemImageId to string value
   * @param i to index
   */
  onClickItemImageInput(itemImageId: string, i: number) {
    document.getElementById(itemImageId + i).click();
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  addLineItemRowWhenClickTableRow(index) {
    const len = (this.commonItemDetails.length) - AppConstant.ONE;
    if (len === index) {
      this.generateVendorItemFormBuilder();
    }
  }

  /**
   * this method can be used to download item image
   */
  viewVendorItemImage(lineItemId, vendorItemNumber, i) {
    this.clickIndex = i;
    this.commonVendorItemDetail.vendorItemImageUrl = null;
    this.vendorItemDetails[this.clickIndex].isProgressItemView = true;
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
      setTimeout(()=>{
      }, 2000)
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
      this.vendorItemDetails[i].isProgressItemView = false;
    }
  }

  /**
   * this method can be used to validate assert account controller
   * @param id to item type id
   */
  validateAssetAccountController(id) {
    const assertAccount = this.createItemForm.get(AppConstant.ASSET_ACCOUNT_CONTROLLER);
    if (id === AppConstant.ITEM_TYPE_ID_INVENTORY) {
      this.isSelectedItemTypeAsInventory = true;
      assertAccount.setValidators(Validators.required);
    } else {
      this.isSelectedItemTypeAsInventory = false;
      assertAccount.clearValidators();
      assertAccount.reset();
      assertAccount.updateValueAndValidity();
    }
    assertAccount.updateValueAndValidity();
  }
}
