import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {CommonUtility} from '../../utility/common-utility';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentProviderService {

  constructor(public httpClient: HttpClient) {
  }

  public commonUtil = new CommonUtility();


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
   * Payment Provider creation
   * @param value any
   */
  createPaymentProvider(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_create_payment_provider', this.getFormData(value),
      {observe: 'response', withCredentials: true});
  }

  /**
   * Activate and Inactivate Payment Providers
   * @param idParam to payment type id
   */
  changePaymentProviderStatus(idParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_toggle_payment_provider_status', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Payment provider List for the grid
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getPaymentProviderList(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_all_payment_provider_list',
      searchFilterDto, {observe: 'response'});
  }

  /**
   * Get a Single payment provider Data
   * @param idParam any
   */
  getPaymentProviderData(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_provider_by_id',
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Get the logo image of the requested payment provide id
   * @param providerId any
   */
  public downloadItemImage(providerId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_provider_image',
      {
        params: {id: providerId},
        responseType: 'blob'
      });
  }

  /**
   * Update Payment Providers
   * @param value any
   */
  updatePaymentProvider(value) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_update_payment_provider',
      this.getFormData(value), {observe: 'response', withCredentials: true});
  }

}
