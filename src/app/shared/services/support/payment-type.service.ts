import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TenantDto} from '../../dto/tenant/tenant-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentTypeService {

  constructor(public httpClient: HttpClient) { }

  /**
   * Payment Type creation
   * @param value any
   */
  createPaymentType(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_create_payment_type', value,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Payment Type List for the grid
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getPaymentTypeList(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_all_payment_type_list', searchFilterDto, {observe: 'response'});
  }

  /**
   * This service use for get payment type dropdown
   */
  getPaymentDropDownList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_types',
      {observe: 'response'});
  }

  /**
   * Get a Single payment type Data
   * @param idParam to payment type id
   */
  getPaymentTypeData(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_type_by_id',
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Activate and Inactivate Payment Types
   * @param idParam to payment type id
   */
  changePaymentTypeStatus(idParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_toggle_payment_type_status', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Update Payment Types
   * @param value to payment type
   */
  updatePaymentType(value) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_update_payment_type',
      value, {observe: 'response', withCredentials: true});
  }

}
