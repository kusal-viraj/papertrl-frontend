import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerInvoiceService {

  public commonUtil: CommonUtility = new CommonUtility();
  public updateTableData = new BehaviorSubject<any>(null);

  constructor(public http: HttpClient) {
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
   * load data to table
   */
  getCustomerInvoiceData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_customer_invoice',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * create invoice
   * @param invoice to customer invoice object
   */
  createInvoice(invoice) {
    return this.http.post(
      ApiEndPoint.API_URL + '/vendor_portal/sec_create_customer_invoice',
      this.getFormData(invoice), {observe: 'response', withCredentials: true});
  }

  /**
   * update invoice
   * @param invoice to customer invoice object
   */
  updateInvoice(invoice) {
    return this.http.post(
      ApiEndPoint.API_URL + '/vendor_portal/sec_edit_customer_invoice',
      this.getFormData(invoice), {observe: 'response', withCredentials: true});
  }


  /**
   * get invoice data
   * @param invoiceId to invoice id
   */
  getInvoiceData(invoiceId) {
    return this.http.get(
      ApiEndPoint.API_URL + '/vendor_portal/sec_view_customer_invoice',
      {observe: 'response', withCredentials: true, params: {invoiceId}});
  }

  /**
   * Delete invoice
   * @param invoiceId to invoice id
   */
  deleteInvoice(invoiceId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_customer_invoice', {},
      {observe: 'response', params: {invoiceId}});
  }

  /**
   * mark invoice as paid
   * @param invoiceId to invoice id
   */
  markInvoiceAsPaid(invoiceId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_mark_customer_invoice_as_paid', {},
      {observe: 'response', params: {invoiceId}});
  }

  /**
   * mark invoice as unpaid
   * @param invoiceId to invoice id
   */
  markInvoiceAsUnPaid(invoiceId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_mark_customer_invoice_as_unpaid', {},
      {observe: 'response', params: {invoiceId}});
  }

  /**
   * Get customer invoice audit trial
   * @param invoiceId to invoice id
   */
  getAuditTrial(invoiceId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_customer_invoice_audit_trail',
      {observe: 'response', params: {invoiceId}});
  }

  /**
   * export customer invoice
   * @param billIdList to billIdList
   */
  exportInvoice(billIdList) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_selected_customer_invoice', billIdList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        }
      )
      .pipe(map(res => {
        return {
          filename: 'customer_invoice_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  /**
   * export all invoices as a bulk
   * @param searchFilterDto to search filter dto
   */
  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_customer_invoice', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'customer_invoice.csv',
          result: res,
          data: new Blob([res.body], {type: res.body.type})
        };
      }));
  }


  /**
   * export customer invoice
   * @param invoiceIdList invoice id to billIdList
   */
  bulkDelete(invoiceIdList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_customer_invoice', invoiceIdList,
      {observe: 'response', withCredentials: true});
  }

  /**
   * download customer invoice
   */
  downloadFileFormat() {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_customer_invoice_import_template',
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

  /**
   * get download percentage of download customer invoice
   * @param userId to user id
   */
  getUploadedPercentage(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_customer_invoice_upload_percentage',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  /**
   * get issue list of uploaded file
   * @param userId to user id
   */
  getUploadedFileIssue(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_customer_invoice_upload_issues',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  /**
   * this method can be used to upload
   * @param file to binary file
   */
  uploadCustomerInvoiceList(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_customer_invoice_list',
      formData, {observe: 'response', withCredentials: true});
  }

}
