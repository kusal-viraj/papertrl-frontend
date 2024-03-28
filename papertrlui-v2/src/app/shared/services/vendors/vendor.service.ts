import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {VendorMasterDto} from '../../dto/vendor/vendor-master-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {VendorSuggestionDto} from '../../dto/vendor/vendor-suggestion-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {VendorListDto} from '../../dto/vendor/vendor-list-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';
import {ResponseDto} from '../../dto/common/response-dto';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private commonUtil: CommonUtility = new CommonUtility();
  groupSubject = new BehaviorSubject(null);
  changeMainTabSet = new BehaviorSubject(null);

  constructor(public httpClient: HttpClient) {
  }

  /**
   * Register Vendor
   */
  registerVendor(vpVendorTemp) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_register_vendor_v2',
      this.getFormData(vpVendorTemp), {observe: 'response'});
  }

  /**
   * This service use for confirm vendor registration
   * @param uuidParam string
   */
  confirmVendorRegistration(uuidParam: string) {
    return this.httpClient.put<ResponseDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_confirm_registration_v2', {},
      {observe: 'response', params: {uuid: uuidParam}});
  }

  /**
   * This method can used to check the verification percentage
   * @param uuid universal identifier for
   */
  public checkVerificationPercentage(uuidParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '',
      {params: {uuid: uuidParam}, observe: 'response'});
  }


  /**
   * Create Vendor
   */
  createVendor(vendorRequestDto, isSendInvitation) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_vendor_v2',
      this.getFormData(vendorRequestDto), {observe: 'response', withCredentials: true, params: {isSendInvitation}});
  }


  getCommunityEmailExist(emailAddressParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_community_email_exist_v2',
      {params: {email: emailAddressParam}, observe: 'response'});
  }


  addVendorFromCommunity(communityVendorId, vendorObj) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_add_updated_community_vendor_to_local_v2',
      this.getFormData(vendorObj), {observe: 'response', withCredentials: true, params: {communityVendorId}});
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
   * Update Vendor
   */
  updateVendor(vendorRequestDto: VendorMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_update_vendor_v2',
      this.getFormData(vendorRequestDto), {observe: 'response', withCredentials: true});
  }


  /**
   * Get Vendor List
   */
  getVendors(event) {
    return this.httpClient.get<VendorListDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_v2 ',
      {observe: 'response'});
  }


  /**
   * Get Single Vendor
   */
  getVendor(vendorId, detailView) {
    return this.httpClient.get<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_v2',
      {observe: 'response', params: {vendorId, detailView}});
  }

  /**
   * Get Single Community Vendor
   */
  getVendorsFromCommunity(vendorId) {
    return this.httpClient.get<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_community_vendor_detail_by_id_v2',
      {observe: 'response', params: {vendorId}}).toPromise();
  }

  /**
   * Get Countries
   */
  getCountries() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_countries',
      {observe: 'response'});
  }

  /**
   * Get States
   */
  getStates() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_state_names',
      {observe: 'response'});
  }

  /**
   * Get Cities
   */
  getCities() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_city_names',
      {observe: 'response'});
  }

  /**
   * Get Tax Classifications
   */
  getTaxClassifications() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/vendor/taxClassifications.json',
      {observe: 'response'});
  }

  /**
   * Get SIC Code
   */
  getSicCode() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_sic_code_list_v2',
      {observe: 'response'});
  }

  /**
   * Get NAICS Code
   */
  getNaicsCode() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_naics_code_list_v2',
      {observe: 'response'});
  }

  /**
   * Export Local Vendors to CSV File
   */
  exportLocalVendor(filterValues) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_export_local_vendor_list', filterValues,
      {
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      }
    )
      .pipe(map(res => {
        return {
          filename: 'vendor_csv.csv',
          result: res,
          data: new Blob([res.body], {type: res.body.type})
        };
      }));
  }


  /**
   * Search vendor Suggestions from letter by letter
   */
  searchVendors(filterValues) {
    return this.httpClient.post<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_v2 ', filterValues,
      {observe: 'response'});
  }


  sendInvitation(vendorId) {
    return this.httpClient.put<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_send_vendor_invitation', {},
      {observe: 'response', params: {vendorId}});
  }

  sendACHInvitation(vendorId){
    return this.httpClient.post<VendorMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_req_vendor_ach_details', {},
      {observe: 'response', params: {vendorId}});
  }


  getVendorSuggestions(vendorNameStartsWith: any) {
    return this.httpClient.get<VendorSuggestionDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_community_vendor_list_v2',
      {observe: 'response', params: {vendorNameStartsWith}});
  }


  checkEmployeeNoAvailability(ein, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_ein_availability',
      {observe: 'response', params: {ein, vendorId}, withCredentials: true});
  }

  checkSsnAvailability(ssn, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_ssn_availability',
      {observe: 'response', params: {ssn, vendorId}, withCredentials: true});
  }

  checkEmailAvailability(email, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_email_availability_v2',
      {observe: 'response', params: {email, vendorId}, withCredentials: true});
  }

  checkVendorCodeAvailability(vendorCode, vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_vendor_code_availability_v2',
      {observe: 'response', params: {vendorCode, vendorId}});
  }

  /**
   * Get Vendor List
   */
  getCommunityVendorsTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_community_vendor_grid_list_v2', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getCommunityVendorsListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/community-vendor-bulk-button-data.json',
      {observe: 'response'});
  }

  /**
   * Update table state
   */
  updateCommunityVendorsTableState(tableDataOptions: TableDataOptionsDto) {
    return this.httpClient.put<any[]>(ApiEndPoint.API_URL + '/vendor_management/', {observe: 'response'});
  }


  activateVendor(vendorId: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_vendor_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {vendorId}
    });
  }

  deleteVendor(vendorId: any) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_v2', {
      observe: 'response',
      withCredentials: true,
      params: {vendorId}
    });
  }

  inActivateVendor(vendorId: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_vendor_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {vendorId}
    });
  }


  uploadVendors(value, isInvited) {
    const formData = new FormData();
    formData.append('file', value.file);
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_vendor_list_v2', formData, {
      observe: 'response',
      params: {isInvited},
      withCredentials: true,
    });
  }

  downloadVendorUploadTemplate() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_vendor_list_template_v2',
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


  addToLocal(id: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_add_community_vendor_to_local_v2', {}, {
      observe: 'response',
      params: {communityVendorId: id}
    });
  }

  bulkAddToLocal(idList: any[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_add_community_vendor_bulk_to_local_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {idList}
    });
  }

  /*
  -------------------------------------VENDOR UPLOAD PROGRESS----------------------------------------------------------------------------->
   */

  getUploadedPercentage(userId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_upload_percentage',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_upload_issue_list',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  downloadAdditionalAttachment(attachmentID) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_vendor_download_additional_attachment_v2', {},
      {
        params: {attachmentId: attachmentID},
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

  downloadClassification(id) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_download_vendor_classification_attachment', {},
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

  downloadClassificationFromVendorCommunity(id) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_download_vendor_classification_attachment_from_community_vendor', {},
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

  deleteAdditionalAttachment(attachmentID) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_vendor_delete_additional_attachment_v2', {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  deleteClassificationAttachment(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_classification_attachment', {
      params: {id},
      observe: 'response'
    });
  }

  deleteW9Attachment(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_w9_form_v2', {
      params: {id},
      observe: 'response'
    });
  }

  deleteClassificationAttachmentFromVendorCommunity(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_classification_attachment_from_community', {
      params: {id},
      observe: 'response'
    });
  }

  deleteW9AttachmentFromVendorCommunity(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_w9_attachment_from_vendor_community', {
      params: {id},
      observe: 'response'
    });
  }

  downloadW9Form(id) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_w9_form_v2',
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

  downloadClassifications(id) {
    return this.httpClient
      .put(ApiEndPoint.API_URL + '/vendor_portal/sec_download_vendor_classification_attachment_from_community_vendor', {},
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

  /**
   * This service use for get payment type list
   */
  getPaymentTypeList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_types',
      {observe: 'response'});
  }

  /**
   * This service use for get payment type list
   */
  getVendorDetailsFromUuid(uuid) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_temp_vendor',
      {observe: 'response', params: {uuid}});
  }

  /**
   * This service use for get payment type list
   */
  getClassificationList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_classification_codes',
      {observe: 'response'});
  }

  /**
   * This service use for get enable status of confidential feature
   */
  getEnabledConfidentialDetailViewFeature(FEATURE_ID) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_feature_status',
      {observe: 'response', withCredentials: true, params: {featureId: FEATURE_ID}});
  }

  /**
   * Get Single Vendor for summary detail view
   */
  getSummaryVendor(id) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_get_vendor_details_dto_v2',
      {observe: 'response', params: {id}});
  }

//////////////////////////////////////// Vendor Groups /////////////////////////////////////////////////

  createGroup(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_vendor_group', value, {
      observe: 'response'
    });
  }

  updateGroup(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_vendor_group', value, {
      observe: 'response'
    });
  }

  getVendorGroupTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_group', searchFilterDto,
      {observe: 'response'});
  }

  deleteVendorGroup(id: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_group',
      {observe: 'response', params: {id}});
  }

  activateVendorGroup(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_vendor_group',
      {observe: 'response', params: {id}});
  }

  inactivateVendorGroup(id: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_vendor_group',
      {observe: 'response', params: {id}});
  }

  deleteBulkVendorGroups(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_group_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  inactivateBulkVendorGroups(ids: any[]) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_vendor_group_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  activateBulkVendorGroups(ids: any[]) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_vendor_group_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  getVendorGroup(id: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_vendor_group',
      {observe: 'response', params: {id}});
  }

  getVendorGroupDropdowns(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_vendor_group_dropdown',
      {observe: 'response', params: {isCreate}});
  }

  getPaymentMailOption() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_mail_option_for_vendors',
      {observe: 'response'});
  }


  validateACHDetailRequest(uuid, tenantId){
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_validate_vendor_ach_details_request',
      {observe: 'response', params: {uuid, tenantId}});
  }


  registerNotACHVendorCommunity(encryptedData, uuid, tenantId){
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_update_requested_ach_details', encryptedData,
      {observe: 'response', params: { uuid, tenantId }});
  }

  registerACHVendorCommunity(encryptedData, uuid, tenantId){
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_update_requested_ach_details_for_community', encryptedData,
      {observe: 'response', params: { uuid, tenantId }});
  }
}
