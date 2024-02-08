import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {PaymentProviderMst} from '../../dto/payment/payment-provider-mst';

@Injectable({
  providedIn: 'root'
})
export class PaymentConfigService {

  constructor(public httpClient: HttpClient) {
  }

  /**
   * this method can be used to get all providers
   */
  getAvailableProviders() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_providers_list',
      {observe: 'response'});  }

  /**
   * this method can be used to get provider data
   */
  getProviderSpecificData(id: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_provider_details_by_id',
      {observe: 'response', params: {id}});
  }

  /**
   * this method can be used to download logo image
   * @param providerID to provider id
   */
  downloadLogoImage(providerID) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_provider_image',
        {
          params: {id: providerID},
          responseType: 'blob'
        });
  }

  /**
   * this method can be used to get all providers
   */
  contactSupportTeam(providerId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_send_payment_support_team_email',
      {observe: 'response', params: {providerId}});
  }

  /**
   * this method can be used to configure new payment provider
   */
  saveProviderData(providerMst: PaymentProviderMst) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_update_payment_provider_details',
      providerMst, {observe: 'response', withCredentials: true});
  }

}
