import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {VpPaymentBillWiseCache} from '../../dto/payment/VpPaymentBillWiseCache';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {AppAuthorities} from '../../enums/app-authorities';
import {BatchPayment} from '../../dto/payment/batch-payment';
import {BehaviorSubject} from 'rxjs';
import {CommonUtility} from '../../utility/common-utility';
import {PrivilegeService} from "../privilege.service";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  public commonUtil: CommonUtility = new CommonUtility();
  updatePaymentSummaryBtnStatus = new BehaviorSubject(null);
  updateTableData: any;

  constructor(public http: HttpClient, private privilegeService: PrivilegeService) {
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

  getVendorPaymentData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_invoice_payments_v2',
      searchFilterDto, {observe: 'response'});
  }

  getBalanceAmount(paymAmount, billID) {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_get_discount_for_payment', {
      params: {billId: billID, paymentAmount: paymAmount}, observe: 'response'
    });
  }

  /**
   * This service use for get provider list
   */
  getPaymentTypeList() {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_types',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get payment types for provider list
   */
  getPaymentTypeForProvider(id) {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_types_dropdown_for_provider',
      {observe: 'response', withCredentials: true, params: {id}});
  }

  /**
   * This service use for get provider list
   */
  getPaymentProviders() {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_providers',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use to reject transaction
   */
  rejectPayment(transaction) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_reject_transaction', transaction, {
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use to approve and re-assign transaction
   */
  approveAndReassignPayment(transaction) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_approve_and_reassign_transaction', transaction, {
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use to approve and finalize transaction
   */
  approveAndFinalizePayment(transaction) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_approve_and_finalize_transaction', transaction, {
      observe: 'response', withCredentials: true
    });
  }

  createPayment(payment) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_create_bulk_transaction',
      this.getFormData(payment), {observe: 'response'});
  }

  getSummaryForPayment(payment) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_get_transaction_list_grouped_by_vendor',
      this.getFormData(payment), {observe: 'response'});
  }

  /**
   * payment audit trial
   */
  getAuditTrial(idParam) {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_view_transaction_audit_trail',
      {observe: 'response', params: {transactionId: idParam}});
  }

  /**
   * payment audit trial
   */
  getVCardAuditTrial(id) {
    return this.http.get(ApiEndPoint.API_URL + '/payment_service/sec_view_v_card_audit_trail',
      {observe: 'response', params: {id}});
  }

  /**
   * this method can be used to get payment related automations
   * @param payment to payment object
   */
  valuesChanged(payment) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_get_batch_payment_automation_v2',
      this.getFormData(payment), {observe: 'response', withCredentials: true}).toPromise();
  }

  /**
   * This method use for change the expense record from payment
   * @param object BillPaymentChangeDto
   */
  changeTaggedExpense(object) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_change_invoice',
      object, {observe: 'response'});
  }

  getPendingIdList(tableSearch) {
    return this.http.post(ApiEndPoint.API_URL + '/payment_service/sec_get_transaction_id_list', tableSearch, {
      observe: 'response', withCredentials: true
    });
  }

  getVCardTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_search_v_card_list',
      searchFilterDto, {observe: 'response'});
  }

  getVCardData(id) {
    let url = '/payment_service/sec_view_v_card';
    if (this.privilegeService.isVendor()){
      url = '/payment_service/sec_view_vendor_digital_card';
    }
    return this.http.get<any>(ApiEndPoint.API_URL + url,
      {observe: 'response', params: {id}});
  }

  topUpVCardData(obj) {
    return this.http.put(ApiEndPoint.API_URL + '/payment_service/sec_top_up_digital_card', obj,
      {observe: 'response'});
  }

  updateVCardData(obj) {
    return this.http.put(ApiEndPoint.API_URL + '/payment_service/sec_edit_v_card', obj,
      {observe: 'response'});
  }

  cancelVCard(id, cancelReason) {
    return this.http.post<any>(ApiEndPoint.API_URL + '/payment_service/sec_cancel_v_card', cancelReason,
      {observe: 'response', params: {id}});
  }

  getCardRelatedTransactions(id) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/payment_service/sec_get_v_card_related_transactions',
      {observe: 'response', params: {id}});
  }

  getCommunityVendorList(isCreate?) {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_community_vendor_dropdown_list_v2',
      {observe: 'response', withCredentials: true});
  }

  getCommunityVendorRelatedUserList(vendorId) {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_community_vendor_user_dropdown_list_v2',
      {observe: 'response', withCredentials: true, params: {vendorId}});
  }

  getEmployeeDetails(userName) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_view_user_by_user_name', userName,
      {observe: 'response', withCredentials: true});
  }

  getVendorEmployeeDetails(vendorId, userName) {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_community_vendor_user_details',
      {observe: 'response', withCredentials: true, params: {userName, vendorId}});
  }

  addDCardData(obj) {
    return this.http.post<any>(ApiEndPoint.API_URL + '/payment_service/sec_create_digital_card', obj,
      {observe: 'response'});
  }

  /**
   * This service use for get data from backend to grid in Vendor Community
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getDigitalCardsGridDataVendorCommunity(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/payment_service/sec_search_digital_card_list_for_vendor_user', searchFilterDto,
      {observe: 'response'});
  }


  inactiveCard(id) {
    return this.http.put(ApiEndPoint.API_URL + '/payment_service/sec_inactivate_digital_card', {},
      {observe: 'response', params: {id}});
  }

  activeCard(id) {
    return this.http.put(ApiEndPoint.API_URL + '/payment_service/sec_activate_digital_card', {},
      {observe: 'response', params: {id}});
  }

  getIntegratedProvidersStatus() {
    return this.http.get<any>(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_provider_connected',
      {observe: 'response'});
  }
}
