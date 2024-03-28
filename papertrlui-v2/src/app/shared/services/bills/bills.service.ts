import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {BillMasterDto} from '../../dto/bill/bill-master-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {DatePipe} from '@angular/common';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {AppAuthorities} from '../../enums/app-authorities';
import {BehaviorSubject} from 'rxjs';
import {PrivilegeService} from '../privilege.service';
import {AppConstant} from '../../utility/app-constant';

@Injectable({
  providedIn: 'root'
})
export class BillsService {
  getValues = new BehaviorSubject<any[]>(null);
  public updateTableData = new BehaviorSubject<boolean>(false);
  private datePipe = new DatePipe('en-US');
  private commonUtil = new CommonUtility();
  public isProcessingPatchingDataFromBillDraft = new BehaviorSubject({isProgress: false, index: AppConstant.ZERO});

  constructor(public http: HttpClient, public privilegeService: PrivilegeService) {
  }

  getBillTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/bill-column-data.json', {observe: 'response'});
  }

  getBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_search_grid_v2', searchFilterDto, {observe: 'response'});
  }

  getDashboardBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_dashboard_bill_search_grid_v2', searchFilterDto, {observe: 'response'});
  }

  getVendorBillTableData(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_bill_search_grid_v2', searchFilterDto,
      {params: {vendorId}, observe: 'response'});
  }

  getBillListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/bills-bulk-button-data.json', {observe: 'response'});
  }

  getVendorRelatedTerms(vendorId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_wise_term',
      {observe: 'response', withCredentials: true, params: {vendorId}});
  }

  createEInvoice(billRequestDto: BillMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_v2',
      this.getEBIllFormData(billRequestDto), {observe: 'response', withCredentials: true});
  }

  /**
   * Convert objects into forms
   */
  getEBIllFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  /**
   * Bill Audit Trial
   */
  getAuditTrial(idParam) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_bill_audit_trail_v2',
      {observe: 'response', params: {billId: idParam}});
  }

  getVendorListDetail() {
    return this.http.get<DropdownDto>('assets/demo/data/dropdowns/bills/vendorAccounts.json',
      {observe: 'response'});
  }

  getViewContent() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_first_bill_v2', {observe: 'response'});
  }

  uploadBills(files: File[], vendorId, templateId) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (vendorId) {
      formData.set('vendorId', vendorId);
    }

    if (templateId) {
      formData.set('templateId', templateId);
    }


    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_bill_v2',
      formData, {withCredentials: true, observe: 'response'});
  }

  public getSubmitPendingInvoices() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_unsubmit_bills_v2', {
      observe: 'response',
      withCredentials: true
    });
  }

  submitAnEInvoice(billMasterDto: BillMasterDto) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/einvoice_service/sec_create_einvoice',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
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

  undoApprove(billId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_undo_bill',
      {}, {params: {billId}, observe: 'response', withCredentials: true});
  }

  skipApproval(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_skip_bill_approval_v2', {}, {
      observe: 'response',
      params: {billId: id}
    });
  }

  exportBill(billIdList) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_selected_bill_v2', billIdList,
        {
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

  downloadBill(id: any) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_attachment_v2',
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

  deleteBill(id, isFromVendorCommunity) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bill_v2',
      {observe: 'response', params: {billId: id, isFromVendorCommunity}});
  }

  appliedPayments(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '', {
      observe: 'response',
      params: {id}
    });
  }

  /**
   * this service use for get project code id
   * @param poId
   */
  getProjectCodeByPo(poId) {
    if (!poId) {
      poId = AppConstant.ZERO;
    }
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_project_code_by_po',
      {observe: 'response', params: {poId}});
  }

  getAccountingPeriodMonthYear(){
    return this.http.get<any>('assets/demo/data/bill-accounting-month-year.json');
  }

  bulkExportSelected(idList) {
    return this.http
      .post(
        ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_selected_bill_v2', idList,
        {
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

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_all_bill_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'bill_csv.csv',
          result: res,
          data: new Blob([res.body], {type: res.body.type})
        };
      }));
  }

  vendorBillBulkExportAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_export_bulk_all_bill_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'bill_csv.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }



  bulkDownloadSelected(idList: any[]) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_selected_bill_v2', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'po_list.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }


  downloadSelectedDetailReport(billIdList) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_bill_detail_report_v2', billIdList,
      {responseType: 'blob'}).pipe(map(res => {
      return {
        filename: 'abc',
        data: new Blob([res], {type: 'application/zip'})
      };
    }));
  }

  bulkDownloadAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_all_bill_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'Bill.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  vendorBulkDownloadAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bulk_all_bill_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'Bill.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  bulkDelete(billIdList, isFromVendorCommunity) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_bill_v2', billIdList,
      {observe: 'response', withCredentials: true, params: {isFromVendorCommunity}});
  }

  bulkReject(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_bulk_bill_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  bulkApprove(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_bulk_bill_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  bulkPaymentProcess(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_mark_as_offline_payment_processing', idList,
      {observe: 'response', withCredentials: true});
  }

  bulkPaymentUnProcess(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_revert_offline_payment_processing', idList,
      {observe: 'response', withCredentials: true});
  }

  paymentProcess(billId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_mark_as_offline_payment_processing', {},
      {observe: 'response', withCredentials: true, params: {billId}});
  }

  paymentUnProcess(billId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_revert_offline_payment_processing', {},
      {observe: 'response', withCredentials: true, params: {billId}});
  }


  /**
   * this method get vendor related pos
   * @param vendorID to vendor id
   */

  getPoList(vendorID) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_v2',
      {params: {vendorId: vendorID}, observe: 'response', withCredentials: true});
  }


  /**
   * This service use for get vendor list
   */

  getVendorList(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_local_vendor_dropdown_list_v2',
      {observe: 'response', withCredentials: true, params: {isCreate}});
  }


  /**
   * this method get terms
   */

  getTermsList() {
    if (this.privilegeService.isVendor()) {
      return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_all_active_terms_v2',
        {observe: 'response', withCredentials: true});
    } else {
      return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_terms_list_v2',
        {observe: 'response', withCredentials: true});
    }
  }

  getOnlyDiscountTermsList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_applicable_bill_terms_list_v2',
      {observe: 'response', withCredentials: true});
  }

  getApprovalUserList(createdBy, authorities, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_get_all_approvers_v2',
      {params: {createdBy, authorities, isCreate}, observe: 'response'});
  }

  getApprovalUserListAccordingToVendorSelection(createdBy, authorities, vendorId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_all_approvers_by_vendor_v2',
      {params: {createdBy, authorities, vendorId, isCreate}, observe: 'response'});
  }

  getApprovalGroupList(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_view_approval_group_list_v2',
      {observe: 'response', params: {isCreate}});
  }

  /**
   * this method get vendor related pos
   * @param vendorID to vendor id
   */

  getTablePoList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_v2',
      {observe: 'response', withCredentials: true});
  }

  getTablePoReceiptList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_all_receipt_drop_down_v2',
      {observe: 'response', withCredentials: true});
  }


  getUom() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list',
      {observe: 'response'});
  }

  getCustomerUserList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_active_customer_invoice_list',
      {observe: 'response'});
  }

  /**
   * This service use for get item list
   */
  getItems(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_dropdown_list_v2',
      {observe: 'response'});
  }

  getItemListByVendorId(vendorId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_dropdown_list_v2',
      {observe: 'response', params: {vendorId, isCreate}});
  }

  /**
   * This service use for get item name by item id
   * @param idParam number
   */
  getItemName(idParam) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_name_by_id', {
      params: {id: idParam},
      observe: 'response', withCredentials: true
    });
  }

  /**
   * this method can be used to create expense as approved
   * @param billRequestDto to expenseMasterDto
   */
  createBillAsApproved(billRequestDto: BillMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_create_bill_as_approved_v2',
      this.getFormData(billRequestDto), {observe: 'response', withCredentials: true});
  }


  getDefaultPoDrawerState(modalName) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_drawer_visibility',
      {observe: 'response', withCredentials: true, params: {modalName}});
  }

  changeDefaultPoDrawerState(modalName) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_mark_drawer_visibility', {},
      {observe: 'response', withCredentials: true, params: {modalName}});
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getOcrTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_ocr_bill_templates_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  getOcrListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/ocr-bulk-button-data.json', {observe: 'response'});
  }

  inactivateOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_bill_template', {},
      {observe: 'response', params: {id}});
  }

  activateOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_bill_template', {},
      {observe: 'response', params: {id}});
  }

  deleteOcr(id) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_bill_template', {},
      {observe: 'response', params: {id}});
  }

  bulkInactivateOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_ocr_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkActivateOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_ocr_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkDeleteOcr(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_ocr_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }

  getTemplateData(id) {
    if ((this.privilegeService.isVendor())) {
      return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_ocr_invoice_template_by_id',
        {observe: 'response', params: {id}});
    } else {
      return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_ocr_bill_template_by_id',
        {observe: 'response', params: {id}});
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecurringBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_recurring_bill_v2', searchFilterDto, {observe: 'response'});
  }

  getRecurringBillListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/recurring-bills-bulk-button-data.json', {observe: 'response'});
  }


  bulkDeleteRecurringBill(idList: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_recurring_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }


  bulkInactivateRecurringBill(idList: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_recurring_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }

  bulkActivateRecurringBill(idList: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_recurring_bill_template_bulk_v2', idList,
      {observe: 'response'});
  }

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

  createTemplate(object) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_recurring_bill_template',
      this.getEBIllFormData(object), {observe: 'response', withCredentials: true});
  }

  updateRecurringTemplate(object) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_recurring_bill_template',
      this.getEBIllFormData(object), {observe: 'response', withCredentials: true});
  }

  getRecurringBillTemplateData(templateId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_recurring_bill_template',
      {observe: 'response', withCredentials: true, params: {templateId}}).toPromise();
  }

  getAutoGeneratedBillNumber(templateId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_next_bill_number',
      {observe: 'response', withCredentials: true, params: {templateId}}).toPromise();
  }


  downloadRecurringAttachment(id) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_recurring_bill_template_attachment',
        {
          params: {attachmentId: id},
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

  downloadRecurringAdditionalFieldAttachments(id) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_recurring_bill_template_additional_field_attachment',
        {
          params: {attachmentId: id},
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

  getOcrEmailList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_template_email_dropdown_dto_v2',
      {observe: 'response'});
  }

  getAccountList(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_dropdown_list',
      {params: {isCreate}});
  }

  getProjectTask(categoryId, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_detailed_approval_codes_by_category',
      {params: {categoryId, isCreate}, observe: 'response'});
  }

  /**
   * Bill Audit Trial
   */
  getConfiguredRule(sectionId, description, vendorId) {
    const object = {
      sectionId ,
      description,
      vendorId
    };
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_fill_line_item_description_field', object,
      {observe: 'response'}
    );
  }

  canEdit(billId: any) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_bill_is_editable', {
      params: {billId},
      observe: 'response',
      withCredentials: true
    });
  }

  canChangeAssignee(billId: any) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_bill_assignee_changeable', {
      params: {billId},
      observe: 'response',
      withCredentials: true
    });
  }

  uploadCreditCardStatement(file: File, headerRow) {
    const formData = new FormData();
    formData.append('attachment', file);
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_credit_card_statement',
      formData, {withCredentials: true, observe: 'response', params: {headerRow}}).toPromise();
  }

  validateCreditDataOnNext(object) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_grouped_statement_record_list',
      this.getFormData(object), {observe: 'response', withCredentials: true}).toPromise();
  }

  createCreditStatement(object) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_finalize_statement',
      this.getFormData(object), {observe: 'response', withCredentials: true}).toPromise();
  }

  previewCreditStatement(object, fourDigits) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_preview_bill_from_statement',
      this.getFormData(object), {observe: 'response', withCredentials: true, params: {fourDigits}}).toPromise();
  }

  /**
   * this method can be used to download po receipt attachment
   * @param receiptMstId to receipt master id
   */
  viewReport(receiptMstId) {
    return this.http
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_receipt_attachment_by_receipt_id',
        {
          params: {receiptMstId},
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
   * this method can be used to get matching table data
   * @param threeWayMatchDto to matching table object
   */
  getMatchingTableData(threeWayMatchDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_three_way_match_details',
      threeWayMatchDto, {observe: 'response', withCredentials: true}).toPromise();
  }

  //Bill Draft related services
  /**
   * Save / edit bill draft
   * @param billMasterDto to bill master object
   * @param isEdit to identify edit view
   * @param isOverrideData to is override data from draft and perform save as draft
   */
  saveBillAsDraft(billMasterDto: BillMasterDto, isEdit, isOverrideData) {
    return this.http.post((isEdit || isOverrideData) ? ApiEndPoint.API_URL + '/vendor_portal/sec_edit_bill_draft' :
        ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_as_draft',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * Save bill as draft from bill submit screen
   * @param billMasterDto to bill master object
   */
  billSubmitSaveBillAsDraft(billMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_bill_draft',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * check availability of draft equals to entered po number
   * @param billNo to bill number
   * @param vendorId to vendor id
   */
  getAvailableDraftIdByBillNumber(billNo, vendorId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_bill_draft_available',
      {params: {billNo, vendorId}, observe: 'response'});
  }

  /**
   * this method used for get user's available draft list
   */
  getUserAvailableDraftList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_drafts',
      {observe: 'response', withCredentials: true});
  }


  getDescriptionWiseAccItem(sectionID, descriptions, vendorID) {
    return this.http.put(ApiEndPoint.API_URL + `/vendor_portal/sec_get_account_or_item_for_description/${sectionID}/${vendorID ? vendorID : 0}`, descriptions,
      {observe: 'response'}).toPromise();
  }

  inactiveBill(billId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_bill', {},
      {observe: 'response', params: {billId}});
  }

  inactiveBillList(ids: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_bill_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  activeBill(billId) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_bill', {},
      {observe: 'response', params: {billId}});
  }

  activeBillList(ids: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_bill_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  getDepartment(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_department',
      {observe: 'response', params: {isCreate}});
  }
  /**
   * This service use for get enable status of confidential feature
   * @param projectId to project master id
   * @param isCreate what is the screen
   * @param billId to bill id
   */
  loadAccountProjectCodeWise(projectId, isCreate, billId?) {
    if (isCreate == null) {
      isCreate = false;
    }
    if (!billId) {
      billId = 0;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_dropdown_list_project_wise',
      {observe: 'response', withCredentials: true, params: {isCreate, projectId, billId}});
  }

  /**
   * This service use for get project codes
   * @param categoryId to categoryId
   * @param isCreate identify what is the screen
   * @param billId to bill master id
   */
  getProjectTaskUserWise(categoryId, isCreate?, billId?) {
    if (isCreate == null) {
      isCreate = false;
    }
    if (!billId) {
      billId = 0;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_project_code_user_wise',
      {params: {categoryId, isCreate, billId}, observe: 'response'});
  }

  /**
   * check whether can proceed payment
   * @param billId to bill master id
   */

  canPay(billId: any) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_bill_can_payable', {
      params: {billId},
      observe: 'response',
      withCredentials: true
    });
  }
  checkAccountNumber(itemId, projectId) {
    if (itemId) {
      return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_account',
        {observe: 'response', params: {itemId, projectId}});
    }
  }
}
