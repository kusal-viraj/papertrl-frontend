import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class FundingAccountService {

  constructor(public httpClient: HttpClient) { }

  /**
   * This service use for create new funding account
   * @param fundingAccount form data of bank account create
   */
  createFundingAccount(fundingAccount) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_create_bank_account',
      fundingAccount, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for update the existing funding account
   * @param fundingAccount form data of bank account create
   */
  updateFundingAccount(fundingAccount) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/payment_service/sec_update_bank_account',
      fundingAccount, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get bank list
   */
  getBankList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_bank_list',
      {observe: 'response'});
  }

  /**
   * This service use for delete bank account
   * @param bankAccountId bank account id
   */
  deleteBankAccount(bankAccountId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/payment_service/sec_delete_bank_account_by_id',
      {params: {bankAccountId}, observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get payment type list
   */
  getPaymentTypes() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_types',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get bank accounts
   */
  getAllBankAccounts() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_bank_accounts',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get bank account by id
   * @param bankAccountId bank account id
   */
  getFundingAccountById(bankAccountId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_bank_account_detail_by_id',
      {observe: 'response', params: {bankAccountId}});
  }

  /**
   * This service use for change bank account service as an active/inactive
   * @param bankAccountId bank account id
   */
  markBankAccountAsDefault(bankAccountId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_mark_back_account_as_default', {},
      {observe: 'response', params: {bankAccountId}});
  }

  /**
   * This service use for search funding account by letter
   * @param enteredValue user enter values inside the search box
   */
  searchBankAccounts(enteredValue, accountType, filterValue) {
    const paramsObject = {
      enteredValue,
      accountType,
      filterValue
    };
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_search_bank_account/', paramsObject,
      {observe: 'response'});
  }

  /**
   * This service use for activate or inactivate funding account
   * @param bankAccountId ID of the particular funding account
   * @param isActive current status of funding account
   */
  activateInactivateFundingAccount(bankAccountId, isActive) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/payment_service/sec_change_back_account_status', {},
      {observe: 'response', params: {id : bankAccountId, isActive}});
  }

  /**
   * This service use for search funding account by letter
   * @param id funding account type id
   */
  getPaymentTypesAccountTypeWise(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_type_by_account_type',
      {observe: 'response', params: {id}});
  }

  getPaymentChannel(paymentTypeId, bankId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/payment_service/sec_get_payment_channel_list_by_payment_type',
      {observe: 'response', params: {paymentTypeId, bankId}});
  }
}
