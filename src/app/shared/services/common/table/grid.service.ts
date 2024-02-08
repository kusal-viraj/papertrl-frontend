import {Injectable} from '@angular/core';
import {TableColumnsDto} from '../../../dto/table/table-columns-dto';
import {ApiEndPoint} from '../../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {TableDataOptionsDto} from '../../../dto/table/table-data-options-dto';
import {DropdownDto} from '../../../dto/common/dropDown/dropdown-dto';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridService {

  dropDownSubject: Subject<any> = new Subject<any>();
  updateDropDownSubject: Subject<any> = new Subject<any>();

  constructor(public httpClient: HttpClient) {
  }

  /**
   * Get Approval Group table grid
   */
  getTableStructure(GRID_NAME) {
    return this.httpClient.get<TableColumnsDto>(ApiEndPoint.API_URL + '/common_service/load_data_grid', {
      params: {gridName: GRID_NAME},
      observe: 'response', withCredentials: true
    });
  }

  /**
   * Update table state
   */
  updateTableState(changeRequestDto: TableDataOptionsDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/save_data_grid_state',
      changeRequestDto, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get dropdown list
   */
  getDropdownList(url) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + url,
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get dropdown list
   */
  resetTableStructure(gridName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/reset_grid_columns',
      {observe: 'response', withCredentials: true, params: {gridName}});
  }

  updateLineItemTableState(changeRequestDto){
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/save_line_item_state',
      changeRequestDto, {observe: 'response', withCredentials: true});
  }

  getLineItemTableState(GRID_NAME) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/get_line_item_state', {
      params: {gridName: GRID_NAME}, observe: 'response', withCredentials: true});
  }

  resetLineItemTableState(gridName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/reset_line_item_state',
      {observe: 'response', withCredentials: true, params: {gridName}});
  }
}
