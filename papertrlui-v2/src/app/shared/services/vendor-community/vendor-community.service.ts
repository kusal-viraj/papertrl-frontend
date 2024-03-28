import { Injectable } from '@angular/core';
import {VendorMasterDto} from '../../dto/vendor/vendor-master-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {CommonUtility} from '../../utility/common-utility';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class VendorCommunityService {

  private commonUtil: CommonUtility = new CommonUtility();

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

  getVendor(vendorId) {
    return this.httpClient.get<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_community_vendor_detail_by_user_v2',
      {observe: 'response'});
  }

  /**
   * Update Vendor
   */
  updateVendor(vendorRequestDto: VendorMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_update_community_vendor_v2',
      this.getFormData(vendorRequestDto), {observe: 'response', withCredentials: true});
  }

  checkEmailAvailability(email, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_email_availability_community_v2',
      {observe: 'response', params: {email, vendorId}, withCredentials: true});
  }

  checkSsnAvailability(ssn, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_ssn_availability_community_v2',
      {observe: 'response', params: {ssn, vendorId}, withCredentials: true});
  }

  checkEmployeeNoAvailability(ein, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_ein_availability_community_v2',
      {observe: 'response', params: {ein, vendorId}, withCredentials: true});
  }

  downloadW9Form(id) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_w9_attachment_from_vendor_community',
        {
          params: {id},
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }
}
