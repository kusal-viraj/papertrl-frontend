import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {ItemMasterDto} from '../../dto/item/item-master-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AppConstant} from '../../utility/app-constant';
import {map} from 'rxjs/operators';
import {CommonUtility} from "../../utility/common-utility";

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  updateTableData = new BehaviorSubject<any>(null);
  public commonUtil: CommonUtility = new CommonUtility();
  successfullyMappedVendorItem = new BehaviorSubject<any>(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Get Item table Data
   */
  getItemTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/item-column-data.json', {observe: 'response'});
  }

  /**
   * Get Item Data List
   */
  getItemTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_search_item_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * Check whether allowed to delete item
   */
  CheckWhetherAllowedToDeleteItem(itemVendorWise) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_delete_vendor_item_v2',
      itemVendorWise, {observe: 'response', withCredentials: true});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.http.put<any[]>('', {observe: 'response'});
  }

  /**
   * Create Single Item
   */
  createItem(masterDto: ItemMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_create_item',
      this.getFormData(masterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * Convert objects into forms
   */
  getFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  /**
   * This method can be used to get form data
   * @param item to item sata
   */

  public getItemFormData(item: ItemMasterDto) {
    const formData = new FormData();
    for (const key in item) {
      if (item[key] != null) {
        if (key === 'itemTypeId') {
          if (item[key] [AppConstant.ID_ATTR] !== null && item[key][AppConstant.ID_ATTR] !== undefined) {
            formData.append(key.concat(AppConstant.DOT_STRING)
              .concat(AppConstant.ID_ATTR), item[key][AppConstant.ID_ATTR]);
          }
        } else if (key === 'createdOn' || key === 'lastUpdatedOn' || key === 'deletedOn') {
          formData.append(key, new Date(item[key]).toUTCString());
        } else {
          formData.append(key, item[key]);
        }
      }
    }

    if (undefined === item.itemImage || null === item.itemImage) {
      formData.delete('itemImage');
    }

    formData.delete('category');

    return formData;
  }

  /**
   * Update Single Item
   */
  updateItem(itemRequestDto: ItemMasterDto) {
    return this.http.put('/common_service/sec_create_item', this.getItemFormData(itemRequestDto),
      {observe: 'response', withCredentials: true});
  }

  /**
   * Get Single Item
   */
  getItemDetails(itemID) {
    return this.http.get<ItemMasterDto>(ApiEndPoint.API_URL + '/common_service/sec_view_item',
      {observe: 'response', params: {itemId: itemID}});
  }

  public downloadItemImage(itemIdParam) {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_item_image',
        {
          params: {itemId: itemIdParam},
          responseType: 'blob'
        });
  }

  public downloadVendorItemImage(itemIdParam) {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_vendor_item_image',
        {
          params: {vendorItemId: itemIdParam},
          responseType: 'blob'
        });
  }


  /**
   * Delete Item
   */
  deleteItem(itemID) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_item_v2', {},
      {observe: 'response', params: {id: itemID}});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getItemListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/item-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Unlock a Single User Data
   * @param idParam to user id
   */
  changItemStatus(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_toggle_item_status', {},
      {observe: 'response', params: {id: idParam}});
  }

  getItemType() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_type_dropdown_list',
      {});
  }

  /**
   * Get item list not considering vendor
   */
  getItemListNotConsideringVendor() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_dropdown_list_not_considering_vendor',
      {observe: 'response'});
  }

  getUom() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list',
      {});
  }

  getParentItem(id, type) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_parent_item_dropdown_list_create',
      {params: {id,type}});
  }

  getCategory() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_category_dropdown_list',
      {});
  }



  uploadItemList(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_upload_item_list_v2',
      formData, {observe: 'response', withCredentials: true});

  }

  public downloadFileFormat() {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_product_import_template',
        {
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
        };
      }));
  }


  checkItemNoAvailabilityItemNumber(itemNum, itemTypeId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_check_item_no_availability',
      {params: {itemNo: itemNum, productTypeId: itemTypeId}, observe: 'response'});
  }


  getUploadedPercentage(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_upload_percentage_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_upload_issues_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  /*
   * Bulk Actions------------------------------------------------------------------------------------------>
   */

  deleteItemList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_item_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  activeItemList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_item_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  inactiveItemList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_item_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /*
 * Single Actions------------------------------------------------------------------------------------------>
 */

  inactiveItem(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_item_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  activeItem(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_item_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  delteItem(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_item_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Get item popup data
   */
  getItemPopupData(itemID) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_details_dto_v2',
      {observe: 'response', params: {id: itemID}});
  }

  //vendor item related services

  /**
   * this method can be used to download vendor item template
   */
   downloadVendorItemFileFormat() {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_vendor_item_import_template',
        {
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
        };
      }));
  }


  /**
   * this method can be used to upload vendor item list
   * @param item to vendorItem Obj
   */
  uploadVendorItemItemList(item: any) {
    const formData = new FormData();
    formData.set('file', item.file);
    formData.set('vendorId', item.vendorId);
    formData.set('itemTypeId', item.itemTypeId);
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_upload_vendor_item_list_v2',
      formData, {observe: 'response', withCredentials: true});

  }

  /**
   * Get Item Data List
   */
  getVendorItemTableData(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_search_vendor_item_v2',
      searchFilterDto, {observe: 'response', withCredentials: true, params: {vendorId}});
  }

  /**
   * Map vendor Item
   * @param vendorItemDto to vendorItemDto
   */
  mapItem(vendorItemDto: any) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_save_uploaded_vendor_item_list_v2',
      vendorItemDto, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get vendor related item list
   * @param vendorId to vendor id
   * @param isCreate to isCreate
   */
  getItemListByVendorId(vendorId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_dropdown_list_v2',
      {observe: 'response', params: {vendorId, isCreate}});
  }

}
