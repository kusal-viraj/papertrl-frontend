import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BillApproveDto} from '../../dto/bill/bill-approve-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {AuditTrialDto} from '../../dto/common/audit-trial/audit-trial-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {PoMasterDto} from '../../dto/po/po-master-dto';
import {BillMasterDto} from '../../dto/bill/bill-master-dto';
import {AppAuthorities} from '../../enums/app-authorities';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BillApprovalsService {

  private commonUtil = new CommonUtility();

  constructor(public httpClient: HttpClient) {
  }

  /**
   * Get Approvable PO Item
   */
  getApprvableBillIdList(tableSearch, pendingOnly) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_id_list_v2', tableSearch, {
      observe: 'response', withCredentials: true, params: {pendingOnly}
    });
  }

  getItemDetails(id) {
    return this.httpClient.get<BillApproveDto>('assets/demo/data/edit-data/bill-approve-main-view-data.json',
      {observe: 'response', params: {id}});
  }


  getPoNumbers() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/bills/pos.json',
      {observe: 'response'});
  }

  getReceiptNumbers() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/bills/receipts.json',
      {observe: 'response'});
  }

  getAccounts() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/bills/accounts.json',
      {observe: 'response'});
  }

  approveBill(billApproveReceiptForm) {
    return this.httpClient.post('', billApproveReceiptForm, {observe: 'response', withCredentials: true});
  }

  /**
   * Bill Audit Trial
   */
  getAuditTrial(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_bill_audit_trail_v2',
      {observe: 'response', params: {billId: idParam}});
  }

  getBillDetail(billId, isDetailView) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_v2',
      {observe: 'response', params: {billId, isDetailView}});
  }

  getSummaryBillDetail(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_bill_details_dto_v2',
      {observe: 'response', params: {id}});
  }

  rejectBill(billMasterDto: BillMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_bill_approval_v2', billMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  approveAndReassignBill(billMasterDto: BillMasterDto, isInsertApprover: boolean) {
    const api = isInsertApprover ? '/vendor_portal/sec_insert_approver_to_bill' : '/vendor_portal/sec_approve_and_reassign_bill_v2';
    // this.removeAdditionalFieldData(billMasterDto);
    return this.httpClient.put(ApiEndPoint.API_URL + api, this.getFormData(billMasterDto), {
        observe: 'response',
        withCredentials: true
      });
  }

  approveAndFinalize(billMasterDto: BillMasterDto) {
    // this.removeAdditionalFieldData(billMasterDto);
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_and_finalize_bill_v2', this.getFormData(billMasterDto), {
      observe: 'response',
      withCredentials: true
    });
  }

  getPurchaseAccountList(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_purchase_account_dropdown_list', {params: {isCreate}});
  }

  /**
   * This service use for get item name by item id
   * @param idParam number
   */
  getItemName(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_name_by_id', {
      params: {id: idParam},
      observe: 'response', withCredentials: true
    });
  }

  getAccountName(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_view_account', {
      params: {accountId: idParam},
      observe: 'response', withCredentials: true
    });
  }

  removeAdditionalFieldData(billMasterDto: BillMasterDto) {

    billMasterDto.additionalData = undefined;

    billMasterDto.billExpenseCostDistributions.forEach(value => {
      value.additionalData = undefined;
      value.additionalFieldAttachments = undefined;
    });

    billMasterDto.billItemCostDistributions.forEach(value => {
      value.additionalData = undefined;
      value.additionalFieldAttachments = undefined;
    });

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

  deleteBillAttachment(attachmentID) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_bill_delete_additional_attachment_v2', {}, {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  downloadBillAttachment(attachmentID) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_bill_download_additional_attachment_v2', {},
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
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  getBillPaymentSummaryDetail(id, documentType) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_bill_related_payment_summary',
      {observe: 'response', params: { id, documentType }});
  }
}
