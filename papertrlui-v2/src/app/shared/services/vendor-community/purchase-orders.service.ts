import { Injectable } from '@angular/core';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {PoMasterDto} from '../../dto/po/po-master-dto';
import {CommonUtility} from '../../utility/common-utility';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {
  public commonUtil: CommonUtility = new CommonUtility();

  constructor(public httpClient: HttpClient) { }

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
   * This service use for get data from backend to grid
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getPOTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_purchase_orders_v2', searchFilterDto,
      {observe: 'response'});
  }
  /**
   * This service use for get data from backend to grid
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getPoDashboardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_dashboard_po_list', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * This method use for get PO information
   * @param poId number
   */
  getPoData(poId) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_vendor_po_v2',
      {params: {poId}, observe: 'response', withCredentials: true});
  }

  /**
   * This method use for approve purchase order
   * @param poMasterDto PoMasterDto
   */
  purchaseOrderApprove(poMasterDto: PoMasterDto, tenantId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_po_approve_v2',
      poMasterDto, {observe: 'response', withCredentials: true, params:{tenantId}});
  }



  /**
   * This method use for Under Discussion purchase order
   * @param poMasterDto PoMasterDto
   */
  purchaseOrderUnderDiscussion(poMasterDto: PoMasterDto, tenantId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_state_under_descussion_po_v2',
      poMasterDto, {observe: 'response', withCredentials: true, params :{tenantId}});
  }

  /**
   * This method use for Reject purchase order
   * @param poMasterDto PoMasterDto
   */
  purchaseOrderReject(poMasterDto: PoMasterDto, tenantId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_purchase_order_by_vendor_v2',
      poMasterDto, {observe: 'response', withCredentials: true, params : {tenantId}});
  }

  public getAdditionalField(id, isViewDetails, tenantId, isCreate) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_fields_by_customer_v2', {
      params: {id, isDetailSection: isViewDetails, tenantId, isCreate},
      observe: 'response',
      withCredentials: true
    });
  }

  getAllApprovedPOList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_v2',
      {observe: 'response', withCredentials: true});
  }
}
