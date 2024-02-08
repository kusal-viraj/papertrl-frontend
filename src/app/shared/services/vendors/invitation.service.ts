import {Injectable} from '@angular/core';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {VendorInvitationMasterDto} from '../../dto/vendor/vendor-invitation-master-dto';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  getValues = new BehaviorSubject<any[]>(null);

  constructor(public httpClient: HttpClient) {
  }


  /**
   * Get Invitation List
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getInvitationTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_invitation_list_v2', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * Get Local Vendor Email Availability
   * @param emailParam string
   */
  checkVendorEmailAvailableLocal(emailParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_email_availability_v2',
      {observe: 'response', params: {email: emailParam, vendorId: null}});
  }

  /**
   * Get Community Vendor Email Availability
   * @param emailParam string
   */
  checkVendorEmailAvailableCommunity(emailParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_community_email_exist_v2',
      {observe: 'response', params: {email: emailParam}});
  }

  /**
   * Get Invitation Vendor Email Availability
   * @param emailParam string
   */
  checkVendorEmailAvailableInvitation(emailParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_duplicate_invitation_v2',
      {observe: 'response', params: {email: emailParam}});
  }

  /**
   *  Send Vendor Invitation
   * @param invitationMaster VendorInvitationMasterDto
   */
  sendVendorInvitation(invitationMaster: VendorInvitationMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_vn_invitation_v2', invitationMaster, {
      observe: 'response'
    });
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getUserListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-invitation-bulk-button-data.json',
      {observe: 'response'});
  }

  deleteInvitation(id: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vn_invitation_v2', {}, {
      observe: 'response', params: {invitationId: id}
    });
  }

  resendInvitation(id: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_re_send_vn_invitation_v2', {}, {
      observe: 'response', params: {invitationId: id}
    });
  }

  deleteInvitationsList(idList: any[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_invitation_v2', {}, {
      observe: 'response',
      params: {invitationIds: idList}
    });
  }

  resendInvitationsList(idList: any[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_re_send_bulk_vn_invitation_v2', {}, {
      observe: 'response',
      params: {invitationIds: idList}
    });
  }


}
