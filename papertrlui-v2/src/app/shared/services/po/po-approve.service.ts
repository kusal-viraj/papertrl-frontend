import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {PoApprovalDto} from '../../dto/po/po-approval-dto';

@Injectable({
  providedIn: 'root'
})
export class PoApproveService {

  constructor(public httpClient: HttpClient) { }

  /**
   * Get PO Item
   */
  getItemDetails(id) {
    return this.httpClient.get<PoApprovalDto>('assets/demo/data/edit-data/po-approve-view-data.json',
      {observe: 'response', params: {id}});
  }

  /**
   * Get Approvable PO Item
   */
  getApprvablePoIdList() {
    return this.httpClient.get<PoApprovalDto>('assets/demo/data/edit-data/po-approve-view-data.json',
      {observe: 'response'});
  }
  /**
   * Reject PO
   */
  rejectPo(id) {
    return this.httpClient.post('assets/demo/data/edit-data/po-approve-view-data.json',
      {observe: 'response', params: {id}});
  }
  /**
   * Get Approve PO
   */
  approvePo(id, formdata) {
    return this.httpClient.post('assets/demo/data/edit-data/po-approve-view-data.json', formdata,
      {observe: 'response', params: {id}});
  }

  getApproveApproversDropDown() {
    return this.httpClient.get<DropdownDto>('assets/demo/data/dropdowns/po/po-approve-approvers.json',
      {observe: 'response'});
  }
}
