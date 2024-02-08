import {Injectable} from '@angular/core';
import {ExpenseApproveDto} from '../../dto/expense/expense-approve-dto';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ExpenseMasterDto} from '../../dto/expense/expense-master-dto';
import {ExpenseTableDto} from '../../dto/expense/expense-table-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {AuditTrialDto} from '../../dto/common/audit-trial/audit-trial-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AppAuthorities} from '../../enums/app-authorities';
import {map, shareReplay} from 'rxjs/operators';
import {CommonUtility} from '../../utility/common-utility';
import {PoMasterDto} from '../../dto/po/po-master-dto';
import {BillMasterDto} from '../../dto/bill/bill-master-dto';
import {BehaviorSubject} from 'rxjs';
import {PrivilegeService} from '../privilege.service';
import {AppConstant} from '../../utility/app-constant';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  public commonUtil: CommonUtility = new CommonUtility();
  public cardListSubject = new BehaviorSubject(null);
  public processListSubject = new BehaviorSubject(null);
  public submittedListSubject = new BehaviorSubject(null);
  public receiptListSubject = new BehaviorSubject(null);
  public changeMainTabSet = new BehaviorSubject(null);
  public uploadedTransactionSubject = new BehaviorSubject(null);
  public approvedListSubject = new BehaviorSubject(null);
  public updateTableData = new BehaviorSubject<any>(null);
  public isProcessingPatchingDataFromDraft = new BehaviorSubject({isProgress: false, index: AppConstant.ZERO});


  constructor(public httpClient: HttpClient, private privilegeService: PrivilegeService) {
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getExpenseBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/expense-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * This service use for change assignee
   * @param expenseMasterDto ExpenseMasterDto
   */
  public changeAssignee(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_expense_change_assignee_v2', expenseMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }


  /*
-----------SEARCH TABLE------------------------------------------------------------------------------------------------------------------->
 */


  getExpenseTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_expense_report_v2',
      searchFilterDto, {observe: 'response'});
  }

  getDashboardExpenseTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_dashboard_expense_v2',
      searchFilterDto, {observe: 'response'});
  }

  /*
-----------FORM SUBMISSIONS--------------------------------------------------------------------------------------------------------------->
 */


  createExpense(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.post(
      ApiEndPoint.API_URL + '/vendor_portal/sec_submit_expense_report_v2',
      this.getFormData(expenseMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * service used to save / edit draft
   * @param expenseMasterDto to expense master object
   * @param isEdit to edit view
   * @param isOverrideData to is override from draft and  perform save as draft
   */
  createExpenseDraft(expenseMasterDto: ExpenseMasterDto, isEdit, isOverrideData) {
    return this.httpClient.post((isEdit || isOverrideData) ? ApiEndPoint.API_URL + '/vendor_portal/sec_edit_expense_report_as_draft' :
        ApiEndPoint.API_URL + '/vendor_portal/sec_save_expense_report_as_draft',
      this.getFormData(expenseMasterDto), {observe: 'response', withCredentials: true});
  }

  editExpense(expenseMaster: ExpenseMasterDto, editOnly) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_resubmit_expense_report_v2',
      this.getFormData(expenseMaster), {
        params: {editOnly},
        observe: 'response', withCredentials: true
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


  /*
-----------DROPDOWN LIST------------------------------------------------------------------------------------------------------------------->
*/


  getExpenseTypeList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_all_expense_types_v2',
      {observe: 'response'});
  }

  getAutomationNameList(DOCUMENT_TYPE_ID) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_automation_list_by_document_type',
      {observe: 'response', params: {documentTypeId: DOCUMENT_TYPE_ID}});
  }


  /*
  -----------SENEGAL ACTIONS-------------------------------------------------------------------------------------------------------------->
   */

  deleteExpense(expenseId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_expense_report_v2',
      {observe: 'response', withCredentials: true, params: {id: expenseId}});
  }

  skipApproval(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_skip_approval_expense_report_v2', expenseMasterDto, {
      observe: 'response', withCredentials: true
    });
  }

  downloadAttachment(id: any) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_expense_attachment_v2',
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

  downloadAdditionalAttachment(id: any) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/',
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

  downloadAdditionalFieldAttachment(id: any) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_expense_download_additional_attachment_v2',
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


  deleteAdditionalFieldExpenseAttachment(expenseId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/',
      {observe: 'response', withCredentials: true, params: {id: expenseId}});
  }

  /**
   * Bill Audit Trial
   */
  getAuditTrial(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_expense_audit_trail_v2',
      {observe: 'response', withCredentials: true, params: {expenseId: idParam}});
  }

  /**
   * Get Single expense data
   * @param expenseId
   * @param isDetailView
   */
  getExpenseDetails(expenseId, isDetailView) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_expense_report_v2',
      {observe: 'response', withCredentials: true, params: {expenseId, isDetailView}});
  }

  getExpenseSummaryDetails(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_expense_details_dto_v2',
      {observe: 'response', withCredentials: true, params: {id}});
  }


  /*
-----------BULK ACTIONS------------------------------------------------------------------------------------------------------------------->
 */


  bulkDelete(billIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_delete_expense_report_v2', billIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkExportSelected(idList) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_export_selected_expense_report_v2', idList,
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
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_export_all_expense_report_v2', searchFilterDto,
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


  bulkDownloadSelected(idList) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_download_selected_expense_report_v2', idList,
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
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_download_all_expense_report_v2', searchFilterDto,
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


  /**
   * This service use for approve and resign po
   * @param expenseMasterDto expenseMasterDto
   */
  public approveAndReassign(expenseMasterDto: ExpenseMasterDto, isInsertApprover: boolean) {
    const api = isInsertApprover ? '/vendor_portal/sec_insert_approver_to_expense' : '/vendor_portal/sec_approve_and_reassigned_expense_report_v2';
    return this.httpClient.put(ApiEndPoint.API_URL + api, expenseMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for approve and finalize po
   * @param expenseMasterDto expenseMasterDto
   */
  approveAndFinalize(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_expense_report_v2', expenseMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  getExpenseAccountList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_expense_account_dropdown_list',
      {});
  }

  getExpenseAccountListForEdit() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_expense_account_dropdown_list_for_edit',
      {});
  }

  rejectExpense(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_expense_report_v2', expenseMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  downloadExpenseAttachment(attId) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_expense_attachment_v2',
        {
          params: {attachmentId: attId},
          responseType: 'blob',
          withCredentials: true,
          observe: 'response',
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  getSubmitPendingExpenses(expenseSearchFilterDto: TableSearchFilterDataDto, pendingOnly) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_expense_id_list_v2', expenseSearchFilterDto,
      {observe: 'response', withCredentials: true, params: {pendingOnly}});
  }

  /**
   * this method can be used to create expense as approved
   * @param expenseMasterDto to expenseMasterDto
   */
  createExpenseAsApproved(expenseMasterDto: ExpenseMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_expense_report_as_approved_v2',
      this.getFormData(expenseMasterDto), {observe: 'response', withCredentials: true});
  }

  deleteExpenseAttachment(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_expense_attachment_v2',
      {observe: 'response', params: {attachmentId: id}});
  }

  deleteAdditionalFieldAttachment(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_expense_delete_additional_attachment_v2',
      {observe: 'response', params: {attachmentId: id}});
  }

  bulkReject(idList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_reject_expense_report_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  bulkApprove(idList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_approve_expense_report_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  valuesChanged(expense) {
    return this.httpClient.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_expense_automation',
      this.getFormData(expense), {observe: 'response', withCredentials: true}).toPromise();
  }

  createExpenseType(expenseType) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_expense_type_v2',
      expenseType, {observe: 'response', withCredentials: true});
  }

  canEdit(expenseId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_expense_is_editable', {
      params: {expenseId},
      observe: 'response',
      withCredentials: true
    });
  }

  undoExpense(expenseId: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_undo_expense', {}, {
      params: {expenseId},
      observe: 'response',
      withCredentials: true
    });
  }

  discardDraft(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_discard_expense_report', {
      params: {id},
      observe: 'response',
      withCredentials: true
    });
  }

/////////////////////////////////////////Credit Card Add////////////////////////////////////////////////////////////

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getAddCreditCardBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/add-card-bulk-button-data.json', {observe: 'response'});
  }

  getAddCardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_search_grid',
      searchFilterDto, {observe: 'response'});
  }

  addCard(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_credit_card_for_employee',
      value, {observe: 'response', withCredentials: true});
  }

  updateCard(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_credit_card_for_employee',
      value, {observe: 'response', withCredentials: true});
  }

  getCardDetail(cardId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_for_employee', {
      params: {cardId}, observe: 'response', withCredentials: true
    });
  }

  deleteCard(cardId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_credit_card_for_employee',
      {observe: 'response', withCredentials: true, params: {cardId}});
  }

  inactivateCard(cardId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_inactivate_credit_card_for_employee',
      {observe: 'response', withCredentials: true, params: {cardId}});
  }

  activateCard(cardId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_activate_credit_card_for_employee',
      {observe: 'response', withCredentials: true, params: {cardId}});
  }

  bulkCardDelete(cardIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_delete_credit_card_for_employee', cardIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkCardInactivate(cardIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_inactivate_credit_card_for_employee', cardIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkCardActivate(cardIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_activate_credit_card_for_employee', cardIdList,
      {observe: 'response', withCredentials: true});
  }

  ////////////////////////////////////////// Upload Card //////////////////////////////////////////////////////////

  getUploadCardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_statement_upload_search_grid',
      searchFilterDto, {observe: 'response'});
  }

  /**
   * This service use for change assignee
   * @param expenseMasterDto ExpenseMasterDto
   */
  public changeEmployee(obj) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_change_employee_in_statement_details', obj, {
      observe: 'response',
      withCredentials: true
    });
  }

  //////////////////////////////////////////// Process Card ///////////////////////////////////////////////////////

  getProcessCardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_process_list_search_grid',
      searchFilterDto, {observe: 'response'});
  }

  getProcessBulkButtons() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/process-card-bulk-button-data.json', {observe: 'response'});
  }

  getSubmitBulkButtons() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/submitted-card-bulk-button-data.json', {observe: 'response'});
  }

  getApprovedBulkButtons() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/approved-card-bulk-button-data.json', {observe: 'response'});
  }

  getReceiptList(searchFilterDto: TableSearchFilterDataDto, receiptIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + `/vendor_portal/sec_get_receipt_list`,
      searchFilterDto, {observe: 'response', withCredentials: true, params: {receiptIdList}});
  }

  getSelectedReceipt(idList) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt_by_receipt_id', idList,
      {observe: 'response', withCredentials: true});
  }

  getMissingReceiptData(missingReceiptFormId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_missing_receipt_form', {
      observe: 'response', withCredentials: true, params: {missingReceiptFormId}
    });
  }

  saveMissingReceipt(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_missing_receipt_form',
      data, {observe: 'response'});
  }

  saveSingleTransaction(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_single_credit_card_transaction',
      data, {observe: 'response'});
  }

  searchMerchants(merchantName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_merchant_list_by_name',
      {observe: 'response', withCredentials: true, params: {merchantName}});
  }

  saveAttachmentToTransaction(obj) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_and_attach_receipt_to_transaction',
      this.getFormData(obj), {observe: 'response', withCredentials: true});
  }

  submitStatements(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_submit_credit_card_transaction_list',
      data, {observe: 'response', withCredentials: true});
  }

  saveAsApprovedStatements(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_as_approved_credit_card_transaction_list',
      data, {observe: 'response', withCredentials: true});
  }

  ////////////////////////////////////////// Receipts /////////////////////////////////////////////////////////////

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getReceiptsBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/receipts-bulk-button-data.json', {observe: 'response'});
  }

  getReceiptTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt_search_grid',
      searchFilterDto, {observe: 'response'});
  }

  getExistingCards(all, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_list', {
      observe: 'response', withCredentials: true, params: {all, isCreate}
    });
  }

  getExistingCardsWithPrivilege(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    const privileged = this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_RECEIPT_UPLOAD_FOR_USER);
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_list_by_privilege', {
      observe: 'response', withCredentials: true, params: {privileged, isCreate}
    });
  }

  createReceipt(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_receipt',
      this.getFormData(value), {observe: 'response', withCredentials: true});
  }


  deleteReceipt(receiptId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_receipt',
      {observe: 'response', withCredentials: true, params: {receiptId}});
  }

  bulkReceiptDelete(cardIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_bulk_delete_receipt', cardIdList,
      {observe: 'response', withCredentials: true});
  }

  downloadReceipt(receiptId: any) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_receipt_attachment',
        {
          params: {receiptId},
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

  uploadReceipts(files: any[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.httpClient.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_upload_receipt_list',
      formData, {withCredentials: true, observe: 'response'});
  }

  detectReceipt(receiptId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_capture_an_receipt',
      {observe: 'response', params: {receiptId}}).toPromise();
  }

  detectAllReceipts() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_capture_user_receipt_list',
      {observe: 'response'}).toPromise();
  }


  getReceiptDetail(receiptId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt',
      {observe: 'response', params: {receiptId}}).toPromise();
  }

  getUnSavedReceiptsList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_not_updated_receipt_list', {
      observe: 'response', withCredentials: true
    });
  }

  getExcludedReceiptList(receiptIdList) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_not_updated_excluded_receipt_list',
      {params: {receiptIdList}, observe: 'response', withCredentials: true});
  }


  ////////////////////////////////// Submitted Cards //////////////////////////////////////////////////////////

  getSubmittedTableData(searchFilterDto: TableSearchFilterDataDto, status) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_credit_card_transaction_list_by_status_search_grid/' + status,
      searchFilterDto, {observe: 'response'});
  }

  getCardWiseTransactions(cardNo, statementId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_statement_details_card_wise', {
      observe: 'response', withCredentials: true, params: {cardNo, statementId}
    }).toPromise();
  }

  getChangeEmployeeData(statementId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_grouped_statement_details_without_saving',
      {observe: 'response', withCredentials: true, params: {statementId}});
  }


  bulkSubmittedReject(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_credit_card_transaction_list', data,
      {observe: 'response', withCredentials: true});
  }

  bulkSubmittedApprove(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_credit_card_transaction_list', data,
      {observe: 'response', withCredentials: true});
  }

  submittedReject(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_credit_card_transaction', data,
      {observe: 'response', withCredentials: true});
  }

  submittedApprove(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_credit_card_transaction', data,
      {observe: 'response', withCredentials: true});
  }


  submittedSkipApproval(transactionDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_skip_approval_credit_card_transaction', transactionDto, {
      observe: 'response', withCredentials: true
    });
  }

  canSubmittedChangeAssignee(transactionId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_credit_card_transaction_for_change_assignee', {
      params: {transactionId}, observe: 'response', withCredentials: true
    });
  }

  changeTransactionAssignee(data) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_change_assignee_credit_card_transaction', data, {
      observe: 'response', withCredentials: true
    });
  }

  //////////////////////////////////// Transactions //////////////////////////////////////////////////

  createTransaction(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_credit_card_transaction',
      value, {observe: 'response', withCredentials: true});
  }

  getTransactionListToIds(transactionIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_selected_credit_card_transaction_list',
      transactionIdList, {observe: 'response', withCredentials: true});
  }

  getSelectedTransactionsForBill(transactionList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_credit_card_transaction_cache',
      transactionList, {
        observe: 'response', withCredentials: true
      });
  }

  getSelectedTransactionList(vendorId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_transactions_by_vendor',
      {observe: 'response', withCredentials: true, params: {vendorId}});
  }

  getTransactionAuditTrial(transactionId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_view_transaction_audit_trail_v2',
      {observe: 'response', withCredentials: true, params: {transactionId}});
  }

  saveTransactionsAsBill(billMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_from_credit_card_transactions_as_approved',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  submitForTransactionsAsBill(billRequestDto: BillMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_from_credit_card_transactions',
      this.getFormData(billRequestDto), {observe: 'response', withCredentials: true});
  }

  getAvailableDraftIdByName(reportName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_expense_draft_available',
      {params: {reportName}, observe: 'response'});
  }

  getUserAvailableDraftList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_expense_drafts',
      {observe: 'response', withCredentials: true});
  }

  searchMerchantWiseAcc(merchantName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_account_for_merchant',
      {observe: 'response', withCredentials: true, params: {merchantName}});
  }


  getSplitTransactions(transactionId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_split_transaction_list',
      {observe: 'response', withCredentials: true, params: {transactionId}});
  }

  splitTransaction(data: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_split_transaction_list', data,
      {observe: 'response', withCredentials: true});
  }

  revokeSplitTransaction(transactionId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_revoke_split_transaction_list', '',
      {observe: 'response', withCredentials: true, params: {transactionId}});
  }

  deleteTransaction(transactionId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_transaction_list', {},
      {observe: 'response', withCredentials: true, params: {transactionId}});
  }

  deleteTransactions(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_transaction_list', ids,
      {observe: 'response', withCredentials: true});
  }

  deleteStatement(transactionId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_statement', {},
      {observe: 'response', withCredentials: true, params: {transactionId}});
  }

}
