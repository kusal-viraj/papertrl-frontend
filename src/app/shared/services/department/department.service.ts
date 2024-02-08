import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {ApprovalGroupMasterDto} from "../../dto/approval group/approval-group-master-dto";
import {ApiEndPoint} from "../../utility/api-end-point";
import {TableSearchFilterDataDto} from "../../dto/table/table-search-filter-data-dto";
import {BulkButtonActionDto} from "../../dto/common/bulk-button-action-dto";
import {TableDataOptionsDto} from "../../dto/table/table-data-options-dto";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {


  constructor(public httpClient: HttpClient, public messageService: MessageService) {
  }


  createDepartment(department) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_department',
      department, {observe: 'response', withCredentials: true});
  }

  getDepartment(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_view_department',
      {observe: 'response', params:{id}});
  }

  updateDepartment(department) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_edit_department',
      department, {observe: 'response', withCredentials: true});
  }

  getDepartmentList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_sub_account_wise_department_list',
      {observe: 'response'});
  }

  /**
   * Get Department Data
   * @param searchFilterDto
   */
  getDepartmentTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/common_service/sec_search_departments',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getDepartmentBulkButtonList() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/department-bulk-button-data.json',
      {observe: 'response'});
  }

  deleteDepartment(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/common_service/sec_delete_department',
      {params: {id}, observe: 'response', withCredentials: true});
  }

  activeDepartment(id){
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_activate_department', {},
      {params: {id}, observe: 'response', withCredentials: true});
  }

  inactiveDepartment(id){
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_department', {},
      {params: {id}, observe: 'response', withCredentials: true});
  }

  deleteBulkDepartments(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_delete_department_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  activeBulkDepartments(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_activate_department_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  inactiveBulkDepartments(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_department_bulk', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get department details for detail view
   */
  getDepartmentDetails() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/get_department_details',
      {observe: 'response'});
  }
}
