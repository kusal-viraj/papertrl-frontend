import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {PoReceiptMasterDto} from '../../dto/po-receipt/po-receipt-master-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {PoMasterDto} from "../../dto/po/po-master-dto";
import {AppConstant} from "../../utility/app-constant";

@Injectable({
  providedIn: 'root'
})
export class PoReceiptService {
  getValues = new BehaviorSubject<any[]>(null);
  public commonUtil: CommonUtility = new CommonUtility();
  public isProcessingPatchingDataFromPoReceiptDraft = new BehaviorSubject({isProgress: false, index: AppConstant.ZERO});

  constructor(public http: HttpClient) {
  }


  getPOReceiptTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_receipt_grid_v2', searchFilterDto,
      {observe: 'response'});
  }

  getVendorPOReceiptTableData(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_receipt_grid_v2', searchFilterDto,
      {params: {vendorId}, observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getPOReceiptBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/po-receipt-bulk-button-data.json', {observe: 'response'});
  }

  getPoList() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/po-receipt/poList.json',
      {observe: 'response'});
  }

  getApprovers() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/po-receipt/approvers.json',
      {observe: 'response'});
  }

  getVendorRelatedPoList(vendorId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt_enabled_po_list_v2',
      {params: {vendorId}, observe: 'response', withCredentials: true});
  }

  getVendorRelatedPoListWithPoId(vendorId, poId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt_enabled_po_list_v2',
      {params: {vendorId, poId}, observe: 'response', withCredentials: true});
  }

  getPoReceiptItemsData(poId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_remaining_item_list_v2',
      {params: {poId}, observe: 'response', withCredentials: true});
  }

  getPoReceiptData(preceptID) {
    return this.http.get<PoReceiptMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_receipt_v2',
      {observe: 'response', params: {id: preceptID}});
  }

  getSummaryPoReceiptData(id) {
    return this.http.get<PoReceiptMasterDto>(ApiEndPoint.API_URL + '/common_service/sec_get_po_receipt_details_dto_v2',
      {observe: 'response', params: {id}});
  }

  /**
   * submit po receipt
   */
  submitPoReceiptData(poReceipt) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_po_receipt_v2', this.getFormData(poReceipt), {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * edit po receipt
   * @param poReceiptMasterDto to po receipt dto
   */
  editPoReceiptData(poReceipt) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_update_receipt_v2', this.getFormData(poReceipt), {
      observe: 'response',
      withCredentials: true
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


  deleteReceiptAttachment(attachmentID) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_receipt_attachment_v2', {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  downloadAttachment(attachmentID: any) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_receipt_attachment_v2',
        {
          params: {attachmentId: attachmentID},
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/pdf'})
        };
      }));
  }

  downloadAdditionalAttachment(attachmentID: any) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_download_additional_attachment_v2',
        {
          params: {attachmentId: attachmentID},
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/pdf'})
        };
      }));
  }


  deleteAddtionalAttachment(attachmentID) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_delete_additional_attachment_v2', {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }


  deleteReceipt(id) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_receipt_v2', {
      params: {id},
      observe: 'response'
    });
  }

  bulkDelete(receiptIdList) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_bulk_delete_v2', receiptIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkExportSelected(idList) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_export_bulk_selected_v2', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_export_bulk_all_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  vendorReceiptBulkExportAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_export_bulk_all_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  closePoReceipt(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_close_receipt_v2', '',
      {params: {id}, observe: 'response'});
  }

  closeBulkPoReceipt(receiptIdList) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_bulk_close_v2', receiptIdList,
      {observe: 'response'});
  }

  openPoReceipt(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_re_open_receipt_v2', '',
      {params: {id}, observe: 'response'});
  }

  openBulkPoReceipt(receiptIdList: any[]) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_bulk_open_v2', receiptIdList,
      {observe: 'response', withCredentials: true});
  }


  bulkDownloadSelected(idList) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_download_bulk_selected_v2', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  bulkDownloadAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_download_bulk_all_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  vendorReceiptsBulkDownloadAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_download_bulk_all_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }


  createEInvoice(bills) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_from_po_receipt_v2', this.getFormData(bills),
      {observe: 'response', withCredentials: true});
  }

  getLineCalculations(qty, poDetailId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_get_line_total_discount_v2',
      {params: {qty, poDetailId}, observe: 'response', withCredentials: true});
  }

  viewReport(attachmentId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_receipt_attachment_v2',
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
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  //Po Draft related services

  /**
   * Save / Edit po as draft
   * @param poReceipt to po receipt request object
   * @param isEditDraft to identify edit action
   * @param isOverrideData to is override from draft and  perform save as draft
   */
  savePOReceiptAsDraft(poReceipt, isEditDraft, isOverrideData) {
    return this.http.post((isEditDraft || isOverrideData) ? ApiEndPoint.API_URL + '/vendor_portal/sec_edit_po_receipt_draft' :
      ApiEndPoint.API_URL + '/vendor_portal/sec_save_po_receipt_draft',
      this.getFormData(poReceipt), {observe: 'response', withCredentials: true});
  }

  /**
   * check availability of draft equals to entered po receipt number
   * @param receiptNo to po receipt number
   * @param vendorId
   */
  getAvailableDraftIdByName(receiptNo, vendorId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_po_receipt_draft_available',
      {params: {receiptNo, vendorId}, observe: 'response'});
  }

  /**
   * this method used for get user's available draft list
   */
  getUserAvailableDraftList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_receipt_drafts',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to check whether po receipt can be edit
   * @param poReceiptId receipt id to po receipt id
   */
  poReceiptCanEdit(poReceiptId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_por_is_editable', {
      params: {porId: poReceiptId},
      observe: 'response',
      withCredentials: true
    });
  }

}
