import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiEndPoint} from "../../../utility/api-end-point";
import {BehaviorSubject} from "rxjs";
import {DropdownDto} from "../../../dto/common/dropDown/dropdown-dto";
import {TableSearchFilterDataDto} from "../../../dto/table/table-search-filter-data-dto";
import {BulkButtonActionDto} from "../../../dto/common/bulk-button-action-dto";

@Injectable({
  providedIn: 'root'
})
export class ManageFeatureService {
  public serveToggleStatus = new BehaviorSubject<boolean>(null);

  constructor(public httpClient: HttpClient) {
  }

  /**
   * this method can be used to get feature list
   */
  getFeatureList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_all_active_feature_list',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This method can be used to update feature status
   * @param featureId to feature id
   * @param isActiveFeature to feature active status
   */
  updateFeatureStatus(featureId, isActiveFeature){
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_update_feature_status',{},
      {observe: 'response',withCredentials: true, params:{id: featureId, status:isActiveFeature}});
  }

  getDocumentTypes() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_document_type_list_for_reminder',
      {observe: 'response'});
  }

  getAllEventTypes() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_event_list_for_reminder',
      {observe: 'response'});
  }

  getEventListForDocument(documentId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_get_event_list_by_document_type_for_reminder',
      {observe: 'response', params:{documentId}});
  }

  getFieldForDocument(documentId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/documentId',
      {observe: 'response', params:{documentId}});
  }

  updateReminder(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_update_reminder',
      value, {observe: 'response', withCredentials: true});
  }

  createReminder(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_save_reminder',
      value, {observe: 'response', withCredentials: true});
  }

  getReminder(reminderId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_get_reminder',
      {observe: 'response', params:{reminderId}});
  }

  /**
   * This service use for get documents field list
   */
  getActionEnableFieldList(documentId) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_field_list_by_document_type_for_reminder',
      {observe: 'response', params: {documentId}});
  }

  getReminderTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_search_reminder',
      searchFilterDto, {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getReminderBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/reminder-bulk-button-data.json', {observe: 'response'});
  }

  deleteReminder(reminderId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_delete_reminder',
      {observe: 'response', withCredentials: true, params: {reminderId}});
  }

  inactivateReminder(reminderId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_inactivate_reminder',
      {observe: 'response', withCredentials: true, params: {reminderId}});
  }

  activateReminder(reminderId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_activate_reminder',
      {observe: 'response', withCredentials: true, params: {reminderId}});
  }

  bulkReminderDelete(iIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_bulk_delete_reminder', iIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkReminderInactivate(iIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_bulk_inactivate_reminder', iIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkReminderActivate(iIdList) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_bulk_activate_reminder', iIdList,
      {observe: 'response', withCredentials: true});
  }
}
