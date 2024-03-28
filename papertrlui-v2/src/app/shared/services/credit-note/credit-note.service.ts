import {Injectable} from '@angular/core';
import {ApiEndPoint} from "../../utility/api-end-point";
import {HttpClient} from "@angular/common/http";
import {PoMasterDto} from "../../dto/po/po-master-dto";
import {CommonUtility} from "../../utility/common-utility";
import {TableSearchFilterDataDto} from "../../dto/table/table-search-filter-data-dto";
import {BulkButtonActionDto} from "../../dto/common/bulk-button-action-dto";
import {DropdownDto} from "../../dto/common/dropDown/dropdown-dto";
import {map} from "rxjs/operators";
import {BehaviorSubject} from "rxjs";
import {AppConstant} from "../../utility/app-constant";

@Injectable({
  providedIn: 'root'
})
export class CreditNoteService {
  public commonUtil: CommonUtility = new CommonUtility();
  public updatedCreditBalance = new BehaviorSubject(null);
  public updateTableData = new BehaviorSubject<boolean>(false);
  public isProcessingPatchingDataFromCreditNoteDraft = new BehaviorSubject({isProgress: false, index: AppConstant.ZERO});

  constructor(public httpClient: HttpClient) {
  }

  /**
   * this method can be used to get vendor related po list
   * @param vendorId to vendor id
   * @param poId
   */
  getVendorRelatedPoList(vendorId, poId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_by_vendor',
      {params: {vendorId, poId}, observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get vendor related bill list
   * @param vendorId to vendor id
   */
  getVendorRelatedBillList(vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_billlist_dropdown_by_vendor_v2',
      {
        params: {id: vendorId},
        withCredentials: true
      });
  }

  /**
   * this method can be used to get bill remaining balance
   * @param billId to bill id
   */
  getRemainingBalance(billId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_balance_amount',
      {
        params: {billId},
        withCredentials: true
      });
  }

  /**
   * get item related sku
   * @param vendorID to vendor id
   * @param itmMstID to item master id
   */
  getItemRelatedSKU(vendorID, itmMstID) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_vendor_item_dropdown_list_v2',
      {observe: 'response', params: {vendorId: vendorID, itmMstId: itmMstID}});
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

  /**
   * this method can be used to get uom list
   */
  getUom() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list',
      {observe: 'response'});
  }

  /**
   * this method can be used to get vendor email address
   */
  getVendorEmailAddress(vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_email',
      {observe: 'response', params: {vendorId}, withCredentials: true}).toPromise();
  }

  /**
   * this method can be used to get po item details
   * @param poId to selected po id
   */
  getPoLineItemData(poId) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_item_details_for_credit_note',
      {params: {poId}, observe: 'response', withCredentials: true});
  }

  /**
   * This method use for create credit note
   * @param  vendorCreditNote to credit note master object
   */
  createCreditNote(vendorCreditNote) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_credit_note',
      this.getFormData(vendorCreditNote), {observe: 'response', withCredentials: true});
  }

  /**
   * This method use for update credit note
   * @param  vendorCreditNote to credit note master object
   */
  updateCreditNote(vendorCreditNote) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_credit_note',
      this.getFormData(vendorCreditNote), {observe: 'response', withCredentials: true});
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
   * this method can be used to get credit card details
   * Get Item Data List
   */
  getCreditCardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_credit_note',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getCreditNoteBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/credit-note-bulk-action.json',
      {observe: 'response'});
  }


  /**
   * this method get vendor related pos
   */

  getTablePoList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_v2',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get credit note details
   * @param creditNoteId to selected credit note id
   * @param isDetailView to detail view flag
   */
  getCreditNoteDetail(creditNoteId, isDetailView) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_credit_note',
      {params: {creditNoteId, isDetailView}, observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to download additional attachment
   * @param attachmentId to attachment id
   */
  downloadAdditionalAttachment(attachmentId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_credit_note_attachment', {},
      {
        params: {attachmentId},
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

  /**
   * this method can be used to delete attachment
   * @param attachmentID to attachment id
   */
  deleteAdditionalAttachment(attachmentID) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_credit_note_attachment', {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  /**
   * This service use for delete credit note
   * @param id to credit note master id
   */
  deleteCreditNote(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_credit_note',
      {
        params: {id},
        observe: 'response',
        withCredentials: true
      });
  }

  /**
   * This method use for apply to credit
   * @param  applyToCredit to applyToCredit object
   */
  applyToCredit(applyToCredit) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_apply_credit_to_bill', applyToCredit,
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get vendor related credit note list
   * @param vendorId to vendor id
   */
  getVendorRelatedCreditNoteList(vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_note_by_vendor',
      {
        params: {vendorId},
        withCredentials: true
      });
  }

  /**
   * This method use for apply to credit
   * @param  applyToCredit to applyToCredit object
   */
  applyToCreditNote(applyToCredit) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_apply_selected_credit_to_bill', applyToCredit,
      {observe: 'response', withCredentials: true});
  }

  /**
   * check credit note has bill
   * @param creditNoteId to credit note id
   */
  canEdit(creditNoteId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_credit_note_editable', {
      params: {creditNoteId},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * check credit note has bill
   * @param creditNoteId to credit note id
   */
  canEditInVendor(creditNoteId, tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_vendor_credit_note_editable', {
      params: {creditNoteId, tenantId},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * this method can be used to delete additional attachment
   * @param attachmentID to attachment id
   */
  deleteAdditionalFieldAttachment(attachmentID) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_credit_note_additional_attachment_v2', {}, {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  /**
   * this method can be used to download additional attachment
   * @param attachmentId to attachmentId
   */
  downloadAdditionalFieldAttachment(attachmentId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_download_credit_note_additional_attachment_v2', {},
      {
        params: {attachmentId},
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

  /**
   * this method get credit note attached bill details
   */

  getAttachedBillDetail(creditNoteId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_attached_bill_list',
      {observe: 'response', params: {creditNoteId: creditNoteId}, withCredentials: true});
  }

  /**
   * this method can be used to remove attached bill
   * @param billRelationId to selected bill relation id
   */
  removeAttachedBill(billRelationId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_detach_bill_from_credit_note', {
      params: {id: billRelationId},
      observe: 'response'
    });
  }

  /**
   * This method use for apply to credit as bulk
   * @param  noteRelation to selected credit note list
   */
  applyToCreditNoteBulk(noteRelation) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_apply_selected_credit_to_selected_bill', noteRelation,
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get customer email address
   */
  getCustomerEmailAddress(tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_customer_email',
      {observe: 'response', params: {tenantId}, withCredentials: true}).toPromise();
  }

  /**
   * this method can be used to get vendor related po list
   * @param tenantId to tenant id
   */
  getCustomerRelatedPoList(tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_for_vendor_by_customer_v2',
      {params: {tenantId}, observe: 'response', withCredentials: true});
  }

  /**
   * This method use for create credit note and send to customer
   * @param  vendorCreditNote to credit note master object
   * @param saveAsDraft to what is the triggered event
   */
  sendToCustomer(vendorCreditNote, saveAsDraft) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_and_send_vendor_credit_note',
      this.getFormData(vendorCreditNote), {params: {saveAsDraft},observe: 'response', withCredentials: true});
  }

  /**
   * This method use for create credit note and send to customer
   * @param  vendorCreditNote to credit note master object
   * @param saveAsDraft to what is the triggered event
   */
  saveAndDraft(vendorCreditNote, saveAsDraft) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_and_send_vendor_credit_note',
      this.getFormData(vendorCreditNote), {params: {saveAsDraft},observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get credit note search items
   * Get Item Data List
   */
  getCreditNoteTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_credit_note',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get credit note details for vendor
   * @param creditNoteId to selected credit note id
   * @param isDetailView identify get call
   * @param tenantId to customer id
   */
  getCreditNoteDetailForVendor(creditNoteId, isDetailView, tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_credit_note_by_vendor',
      {params: {creditNoteId, isDetailView, tenantId}, observe: 'response', withCredentials: true});
  }

  /**
   * This method use for update credit note from vendor community
   * @param  vendorCreditNote to credit note master object
   * * @param  tenantId to tenantId
   */
  updateCreditNoteFromVendorCommunity(vendorCreditNote, tenantId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_vendor_credit_note',
      this.getFormData(vendorCreditNote), {params: {tenantId},observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to download additional attachment
   * @param attachmentId to attachment id
   * @param tenantId to tenant id
   */
  downloadAdditionalAttachmentFromVendor(attachmentId, tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_vendor_credit_note_attachment',
      {
        params: {attachmentId, tenantId},
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

  /**
   * this method can be used to delete attachment
   * @param attachmentID to attachment id
   * @param tenantId to tenantId
   */
  deleteAdditionalAttachmentFromVendor(attachmentID, tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_credit_note_attachment', {
      params: {attachmentId: attachmentID, tenantId},
      observe: 'response'
    });
  }

  /**
   * This method can be used to delete credit note from vendor
   * @param id to credit note record id
   */
  deleteCreditNoteFromVendor(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_credit_note',
      {params: {id}, observe: 'response', withCredentials: true});
  }

  /**
   * This method can be used to cancel credit note from vendor
   * @param id to credit note record id
   */
  cancelCreditNoteFromVendor(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_cancel_vendor_credit_note',
      {params: {id}, observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used for get vendor related po list
   */
  getVendorPoList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_for_vendor',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method get credit note attached bill details for vendor
   */

  getAttachedBillDetailForVendor(creditNoteId, tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_attached_bill_list_for_vendor',
      {observe: 'response', params: {creditNoteId, tenantId}, withCredentials: true});
  }

  /**
   * this method used to send credit note to customer
   */

  sendCreditNoteToCustomerAsActionButtonOption(id) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_send_credit_note_to_customer',{},
      {observe: 'response', params: {id}, withCredentials: true});
  }

  //Draft related changes

  /**
   * Save / Edit po as draft
   * @param creditNoteDto to po credit note object
   * @param isEditDraft to identify edit action
   * @param isOverrideData to is override from draft and  perform save as draft
   */
  saveCreditNoteAsDraft(creditNoteDto, isEditDraft, isOverrideData) {
    return this.httpClient.post((isEditDraft || isOverrideData) ? ApiEndPoint.API_URL + '/vendor_portal/sec_edit_credit_note_draft' :
      ApiEndPoint.API_URL + '/vendor_portal/sec_create_credit_note_draft',
      this.getFormData(creditNoteDto), {observe: 'response', withCredentials: true});
  }

  /**
   * check availability of draft equals to entered po receipt number
   * @param creditNoteNo to creditNoteNo
   * @param vendorId
   */
  getAvailableDraftIdByName(vendorId, creditNoteNo) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_credit_note_draft_available',
      {params: {creditNoteNo, vendorId}, observe: 'response'});
  }


  /**
   * this method used for get user's available draft list
   */
  getUserAvailableDraftList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_note_drafts',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method used for csv export selected credit notes
   * @param idList to selected credit note id list
   */

  bulkExportSelected(idList) {
    return this.httpClient
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_selected_credit_notes', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        }
      )
      .pipe(map(res => {
        return {
          filename: 'credit_note_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }


  /**
   * this method used for csv export all credit notes
   * @param searchFilterDto to TableSearchFilterDataDto
   */

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_all_credit_notes', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'credit_note_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

}
