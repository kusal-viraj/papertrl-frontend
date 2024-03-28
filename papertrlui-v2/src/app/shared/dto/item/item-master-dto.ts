import {ItemTypeDto} from './item-type-dto';
import {CategoryMstDto} from './category-mst-dto';
import {CommonItemDetails} from "./common-item-details";

export class ItemMasterDto {
  public id: number;
  public itemImage: File;
  public name: string;
  public itemNumber: string;
  public partnerService = false;
  public taxable = false;
  public buyingPrice = 0.00;
  public salesPrice = 0.00;
  public status: string;
  public purchaseDescription: string;
  public salesDescription: string;
  public incomeAccount: number;
  public expenseAccount: number;
  public createdBy: string;
  public createdOn: Date;
  public uomId: number;
  public itemTypeId: ItemTypeDto = new ItemTypeDto();
  public itemCategoryId: number;
  public parentId: number;
  public subLevel: number;
  public vendorId: number;
  public inventoryAssetAccount: number;
  public vendorItemDetails: CommonItemDetails [] = [];
  public updateImage: boolean;
  public category: CategoryMstDto = new CategoryMstDto();

}
