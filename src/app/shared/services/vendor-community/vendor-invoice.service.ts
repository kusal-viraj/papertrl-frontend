import {Injectable} from '@angular/core';
import {ApiEndPoint} from '../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {map} from 'rxjs/operators';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {CommonUtility} from '../../utility/common-utility';
import {AppAuthorities} from '../../enums/app-authorities';
import {BillMasterDto} from '../../dto/bill/bill-master-dto';

@Injectable({
  providedIn: 'root'
})
export class VendorInvoiceService {
  private commonUtil = new CommonUtility();

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

  getTermsList(tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_term_list_by_customer',
      {observe: 'response', withCredentials: true, params: {tenantId}});
  }


  getInvoiceBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/bills-bulk-button-data.json', {observe: 'response'});
  }

  getBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_invoices_v2', searchFilterDto, {observe: 'response'});
  }

  getDashboardBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_dashboard_bill_list', searchFilterDto, {observe: 'response'});
  }


  exportBill(billIdList, tenantId) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_selected_bill_by_customer_v2', billIdList,
        {
          params: {tenantId},
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        }
      )
      .pipe(map(res => {
        return {
          filename: 'bill_csv.csv',
          result: res,
          data: new Blob([res.body], {type: res.body.type})
        };
      }));
  }

  downloadBill(attachmentId, tenantId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_attachment_by_customer_v2',
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
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  downloadOcrAttachment(attachmentId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_attachment_by_customer_v2',
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

  downloadBillAdditionalAttachment(attachmentId, tenantId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_additional_attachment_by_customer_v2',
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
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  generateDetailReport(id: any) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_bill_detail_report_v2',
        {
          params: {billId: id},
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

  deleteBill(billId, tenantId) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bill_by_customer_v2',
      {observe: 'response', params: {billId, tenantId}});
  }


  bulkExportSelected(idList) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_selected_bill_v2', idList, {
          responseType: 'blob',
          withCredentials: true
        }
      )
      .pipe(map(res => {
        return {
          filename: 'invoice_csv',
          data: new Blob([res], {type: 'text/plain'})
        };
      }));
  }

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_all_bill_v2', searchFilterDto, {responseType: 'blob'}
      )
      .pipe(map(res => {
        return {
          filename: 'invoice_csv',
          data: new Blob([res], {type: 'text/plain'})
        };
      }));
  }

  bulkDownloadSelected(idList) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_selected_bill_v2', idList,
      {responseType: 'blob'}).pipe(map(res => {
      return {
        filename: 'abc',
        data: new Blob([res], {type: 'application/zip'})
      };
    }));
  }

  bulkDownloadAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_all_bill_v2', searchFilterDto,
      {responseType: 'blob'}).pipe(map(res => {
      return {
        filename: 'abc',
        data: new Blob([res], {type: 'application/zip'})
      };
    }));
  }


  bulkDelete(billIdList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_bill_v2', billIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkReject(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_bulk_bill_v2', idList,
      {observe: 'response', withCredentials: true});
  }


  getDueDate(dateStr, dateFormat, termId, netDays, dueDate, tenantId,) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_bill_due_date_by_customer_v2',
      {
        params: {dateStr, dateFormat, termId, netDays: netDays ? netDays : '', dueDateStr: dueDate ? dueDate : '', tenantId},
        observe: 'response'
      });
  }

  getPoCeling(poId, tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_remaining_ceiling_by_customer_v2',
      {params: {poId, tenantId}, observe: 'response'});
  }

  getCustomerList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_related_customer_list',
      {observe: 'response', withCredentials: true});
  }

  createEInvoice(billRequestDto, tenantId) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_by_vendor_v2',
      this.getFormData(billRequestDto), {observe: 'response', withCredentials: true, params: {tenantId}});
  }

  getUom(tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list_by_customer',
      {observe: 'response', params: {tenantId}});
  }

  /**
   * This service use for get additional field data
   * @param idParam to id
   * @param isViewDetails to id is detail view
   */
  public getAdditionalField(id, isDetailSection, tenantId, isCreate) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_fields_by_customer_v2', {
      params: {id, isDetailSection, tenantId, isCreate},
      observe: 'response',
      withCredentials: true
    });
  }

  valuesChanged(bill, tenantId) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_automation_by_customer_v2',
      bill, {observe: 'response', withCredentials: true, params: {tenantId}});
  }

  getApprovalUserList(tenantId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    const authoritiesList = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT, AppAuthorities.BILL_OVERRIDE_APPROVAL];

    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_get_all_approvers_by_customer_v2',
      {params: {tenantId, authorities: authoritiesList, isCreate}, observe: 'response'});
  }

  getPoList(tenantId, poId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_by_customer_v2',
      {params: {tenantId, poId}, observe: 'response', withCredentials: true});
  }

  getApprovalGroupList(tenantId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_view_approval_group_list_by_customer_v2',
      {observe: 'response', params: {tenantId, isCreate}});
  }

  getEmailList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_view_approval_group_list_by_customer_v2',
      {observe: 'response'});
  }

  getDateFormats() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_dateformats_from_vendor_v2',
      {observe: 'response', withCredentials: true});
  }

  getTerms() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_all_active_terms_v2',
      {observe: 'response', withCredentials: true});
  }

  getTemplateList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_invoice_template_list_v2',
      {observe: 'response', withCredentials: true});
  }

  getBillDetail(billId, tenantId, isDetailView) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_by_customer_v2',
      {observe: 'response', params: {billId, tenantId, isDetailView}}).toPromise();
  }

  getSubmitPendingInvoices() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_unsubmit_bills_from_vendor_v2', {
      observe: 'response',
      withCredentials: true
    });
  }

  getExcluedBillList(idList) {
    if (idList !== undefined) {
      return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_unsubmit_invoices_execlude_v2',
        {params: {excludeList: idList}, observe: 'response', withCredentials: true});
    }
  }

  getBillAttachment(attachmentId, tenantId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_attachment_by_customer_v2',
        {
          params: {attachmentId, tenantId},
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

  submitBill(billMasterDto: BillMasterDto) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_submit_bill_by_customer_v2',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  validWithFormat(date: string, dateformat: string) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_validate_bill_date_format_v2',
      {params: {dateStr: date, dateFormat: dateformat}, observe: 'response', withCredentials: true});
  }

  editBill(billMasterDto: BillMasterDto, tenantId) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_re_submit_bill_by_vendor_v2',
      this.getFormData(billMasterDto), {params: {tenantId}, observe: 'response', withCredentials: true});
  }

  public getTemplateDetectData(templateID, billiD, tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_attach_bill_template_by_customer_v2',
      {observe: 'response', withCredentials: true, params: {templateId: templateID, billId: billiD, tenantId}});
  }

  uploadInvoices(files: File[], tenantId, templateId) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (templateId) {
      formData.set('templateId', templateId);
    }
    if (tenantId) {
      formData.set('tenantId', tenantId);
    }
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_bill_by_customer_v2',
      formData, {withCredentials: true, observe: 'response'});
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////
  createBillTemplate(billTemplate) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_template_from_vendor_v2', billTemplate, {observe: 'response'});
  }

  getViewContent() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_first_bill_from_vendor_v2', {observe: 'response'});
  }

  getAuditTrial(billId, tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_invoice_audit_trail_v2',
      {observe: 'response', params: {billId, tenantId}});
  }

  getTemplateData(id) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_ocr_invoice_template_by_id',
      {observe: 'response', params: {id}});
  }

  updateInvoiceTemplate(template) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_ocr_invoice_template', this.getFormData(template),
      {observe: 'response'});
  }

  createTemplateFromManagement(template) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_invoice_template_from_management_v2', this.getFormData(template), {observe: 'response'});
  }

  getOcrListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-ocr-bulk-button-data.json', {observe: 'response'});
  }

  getOcrTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_ocr_invoice_templates_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  deleteOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  inactivateOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  activateOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  bulkDeleteOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkInactivateOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkActivateOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

///////////////////////////////////////////////////////////////////////////////////////

  getIntervalList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_interval_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getDays() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_day_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getCustomIntervals() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_custom_interval_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getMonths() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_month_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getWeeks() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_days_of_week_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getRecurringGeneration() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_generation_frequent_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getRecurringOccurrence() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_recurring_occurrence_frequent_list',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getSeparatorList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_separator_list_for_vendor',
      {observe: 'response', withCredentials: true}).toPromise();
  }

  getRecurringBillTemplateData(templateId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_recurring_bill_template',
      {observe: 'response', withCredentials: true, params: {templateId}});
  }

  createTemplate(object) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_recurring_invoice_template',
      this.getFormData(object), {observe: 'response', withCredentials: true});
  }

  updateRecurringTemplate(object) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_recurring_invoice_template',
      this.getFormData(object), {observe: 'response', withCredentials: true});
  }

  getRecurringBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-recurring-invoice-bulk-button-data.json', {observe: 'response'});
  }

  deleteRecurring(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  inactivateRecurring(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  activateRecurring(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_invoice_template', {},
      {observe: 'response', params: {id}});
  }

  bulkDeleteRecurring(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkInactivateRecurring(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkActivateRecurring(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_invoice_template_bulk_v2', idList,
      {observe: 'response'});
  }

  getAutoGeneratedInvoiceNumber(templateId: any) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_next_bill_number',
      {observe: 'response', withCredentials: true, params: {templateId}}).toPromise();
  }

  getRecurringTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_recurring_bill_v2', searchFilterDto, {observe: 'response'});
  }

  /**
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isTenantActive(tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_active_tenant',
      {observe: 'response', withCredentials: true, params: {tenantId}});
  }
}
