import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {CommonUtility} from '../../utility/common-utility';

@Injectable({
  providedIn: 'root'
})
export class FieldConfigurationService {

  public commonUtil: CommonUtility = new CommonUtility();
  constructor(public httpClient: HttpClient) {
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

  getFieldConfiguration(obj) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_get_document_type_vendor_field_config', obj,
      {observe: 'response'});
  }

  getDocuments() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_show_hide_enabled_document_types_v2',
      {observe: 'response'});
  }

  updateConfigurations(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_vendor_field_config', data,
      {observe: 'response'});
  }
}
