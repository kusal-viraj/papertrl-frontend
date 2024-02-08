import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiEndPoint} from "../../../utility/api-end-point";
import {TableSearchFilterDataDto} from "../../../dto/table/table-search-filter-data-dto";

@Injectable({
  providedIn: 'root'
})
export class PoPriceVarianceService {

  constructor(public httpClient: HttpClient) {
  }

  /**
   * this method can be used to create po price variance
   * @param poPriceVarianceMaster to poPriceVarianceMaster Object
   */
  createPoPriceVariance(poPriceVarianceMaster) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_po_price_variance',
      poPriceVarianceMaster, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to create po price variance
   * @param poPriceVarianceMaster to poPriceVarianceMaster Object
   */
  updatePoPriceVariance(poPriceVarianceMaster) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_po_price_variance',
      poPriceVarianceMaster, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get po price variance
   * @param idParam to poPriceVarianceMaster id
   */
  getPoPriceVariance(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_price_variance',
      {observe: 'response', withCredentials: true, params: {id: idParam}});
  }

  /**
   * this method can be used to delete po price variance
   * @param idParam to delete po price variance id
   */
  deletePoPriceVariance(idParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_po_price_variance', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * this method return po price variance list
   * @param searchFilterDto to search filter object
   */
  getPoPriceVarianceTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_po_price_variance', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * this service serve whether vendor has configured po price variance
   * @param vendorId to vendor id
   */
  isVendorExists(vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_variance_exist_by_vendor',
      {params: {vendorId}, observe: 'response'}).toPromise();
  }
}
