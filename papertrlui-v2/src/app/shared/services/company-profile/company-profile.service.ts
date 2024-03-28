import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CompanyProfileMasterDto} from '../../dto/company-profile/company-profile-master-dto';
import {ChangePackage} from '../../dto/company-profile/change-package';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TenantDto} from "../../dto/tenant/tenant-dto";
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {CommonUtility} from "../../utility/common-utility";

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  private commonUtil = new CommonUtility();

  constructor(public httpClient: HttpClient) {
  }


  /**
   * save company profilePic data
   * @param companyProfileMasterDto to companyProfileMasterDto
   */
  saveCompanyProfileData(companyProfileMasterDto: CompanyProfileMasterDto) {
    return this.httpClient.post('', companyProfileMasterDto, {observe: 'response', withCredentials: true});
  }


  // getPackageDetails() {
  //   return this.httpClient.get<ChangePackage>('assets/demo/data/change-package.json', {observe: 'response'});
  // }

  getPackageDetails() {
    return this.httpClient.get<ChangePackage>(ApiEndPoint.API_URL + '/tenant_management/sec_get_package_list', {observe: 'response'});
  }

  /**
   * update package details
   */
  updatePackageDetails(toPackageId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_package_upgrade_request', {toPackageId}, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * deleteExpense package details
   */
  deleteChangeRequest(IdParam) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/tenant_management/sec_del_pkg_upgrade_request',
      {params: {id: IdParam}, observe: 'response', withCredentials: true});
  }

  convertToPortal(tenantIdParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_convert_to_portal', {
      params: {tenantId: tenantIdParam}, observe: 'response'
    });
  }

  tenantConversion(tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_convert_to_portal', {
      params: {tenantId},
      observe: 'response',
      withCredentials: true
    });
  }

  getTenantDetails() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_company_details',
      {observe: 'response'});
  }

  /**
   * This method use for update Tenant basic information
   * @param tenantDto TenantDto
   */
  updateTenant(tenantDto: TenantDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_update_tenant',
      this.getFormData(tenantDto), {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get time zone list
   */
  getTimeZoneList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/tenant_management/sec_get_time_zone_list',
      {observe: 'response'});
  }

  getDateFormats() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_view_dateformats_v2',
      {observe: 'response', withCredentials: true});
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


}
