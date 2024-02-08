import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {BillPaymentMasterDto} from '../../dto/bill-payment/bill-payment-master-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {DatePipe} from '@angular/common';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillPaymentService {
  getValues = new BehaviorSubject<any[]>(null);
  offlinePayTableRefresh = new BehaviorSubject<any>(null);

  public datePipe = new DatePipe('en-US');
  public commonUtil = new CommonUtility();

  constructor(public httpClient: HttpClient) {
  }

  /**
   * This service use for upload bill payments
   * @param file file
   * @param documentTypeId document id
   */
  public uploadPayment(file: File, documentTypeId) {
    const formData = new FormData();
    formData.set('file', file);
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_upload_payment_list_v2',
      formData, {observe: 'response', withCredentials: true, params: {documentTypeId}});
  }

  /**
   * This service use for get bill number list by vendor
   * @param vendorId number
   */
  getBillList(vendorId) {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/bill-payment/bill-list.json',
      {observe: 'response'});
  }

  getVendorRelatedBills(vendorId, billId) {
    if (undefined !== vendorId && 0 !== vendorId) {
      return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bills_dropdown_by_vendor_except_selected_bill',
        {
          params: {vendorId, billId},
          withCredentials: true
        });
    }
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
   * This service use for get payment type list
   */
  getPaymentTypeList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_payment_types',
      {observe: 'response'});
  }

  /**
   * This service use for create new payment
   * @param billPaymentMasterDto BillPaymentMasterDto
   */
  createBillPayment(billPaymentMasterDto: BillPaymentMasterDto) {
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/payment_service/sec_create_payment',
      this.getFormData(billPaymentMasterDto), {observe: 'response'});
  }

  /**
   * This service use for create new payment
   * @param billPaymentMasterDto BillPaymentMasterDto
   */
  createBillPaymentBulk(billPaymentMasterDto) {
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/payment_service/sec_create_bulk_offline_payments',
      this.getFormData(billPaymentMasterDto), {observe: 'response'});
  }

  /**
   * This service use for get bill payment details for view
   * @param billPaymentId number
   */
  getBillPaymentDetailsForView(billPaymentId) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/payment_service/sec_view_transaction',
      {observe: 'response', params: {id: billPaymentId}});
  }

  /**
   * This service use for get transaction details for view
   * @param billPaymentId number
   */
  getBillTransactionDetailsForView(transactionId) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_transaction',
      {observe: 'response', params: {transactionId}});
  }

  /**
   * This method use for get bill payment
   * @param billPaymentMasterDto BillPaymentChangeDto
   */
  changeTaggedInvoice(billPaymentMasterDto: BillPaymentMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_change_invoice',
      billPaymentMasterDto, {observe: 'response'});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.httpClient.put<any[]>('', {observe: 'response'});
  }

  getBillPaymentTableColumns() {
    return this.httpClient.get<any[]>('assets/demo/data/tables/bill-payment-column-data.json', {observe: 'response'});

  }

  getBillPaymentTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_get_transaction_list',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  getApprovedDocuments(searchFilterDto: TableSearchFilterDataDto, documentType) {
    return this.httpClient.post(ApiEndPoint.API_URL + `/payment_service/sec_search_approved_document_list_by_document_type/${documentType}`,
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  getVendorBillPaymentTableData(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_search_vendor_transaction_list', searchFilterDto,
      {params: {vendorId}, observe: 'response'});
  }


  getBillPaymentListBulkActionData() {
    return this.httpClient.get<any[]>('assets/demo/data/tables/bill-payments-bulk-button-data.json', {observe: 'response'});
  }

  getInvoiceListByVendorId(vendor) {
    if (undefined !== vendor && 0 !== vendor) {
      return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_billlist_dropdown_by_vendor_v2',
        {
          params: {id: vendor},
          withCredentials: true
        });
    }
  }

  getInvoice(billId, isDetailView) {
    return this.httpClient.get<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_v2',
      {params: {billId, isDetailView}, observe: 'response', withCredentials: true});
  }

  getDiscountAmountByPayment(billPaymentDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_get_discount_amount_by_payment', billPaymentDto
      , {observe: 'response'}).toPromise();
  }

  uploadPaymentCSV(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_payments',
      formData, {observe: 'response', withCredentials: true});
  }

  markCheckAsMailed(billPaymentMasterDto: BillPaymentMasterDto) {
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/payment_service/sec_mark_as_mailed',
      billPaymentMasterDto, {observe: 'response'});
  }


  /**
   * This service use for download approval group upload template
   */
  downloadBillPaymentTemplate(documentTypeId) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/payment_service/sec_download_payment_import_template',
        {
          responseType: 'blob',
          withCredentials: true,
          params:{documentTypeId}
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
        };
      }));
  }

  downloadBillPaymentReceipt(paymentId: any) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/payment_service/download_payment_receipt',
        {
          params: {paymentId},
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

  cancelTransaction(transactionId, cancelReason) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_cancel_transaction', cancelReason,
      {observe: 'response', params: {transactionId}});
  }

  cancelBulkTransaction(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_cancel_transaction_list',
      ids, {observe: 'response'});
  }

  approveBulkTransaction(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_approve_transaction_list',
      ids, {observe: 'response'});
  }

  getUploadedPercentage(userId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_upload_percentage_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_upload_issues_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }


  bulkExportSelected(idList) {
    return this.httpClient
      .post(
        ApiEndPoint.API_URL + '/payment_service/sec_export_bulk_selected_transactions', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        }
      )
      .pipe(map(res => {
        return {
          filename: 'bill_payment_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/payment_service/sec_export_bulk_all_payment_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'bill_payment_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  vendorPaymentBulkExportAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/payment_service/sec_export_bulk_all_payment_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'bill_payment_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }


  downloadPaymentAdditionalAttachment(attachmentID: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_payment_download_additional_attachment_v2', {},
      {
        params: {attachmentId: attachmentID},
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map((res: any) => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }
}
