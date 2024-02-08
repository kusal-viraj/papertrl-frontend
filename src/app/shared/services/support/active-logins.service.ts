import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {ApiEndPoint} from "../../utility/api-end-point";

@Injectable({
  providedIn: 'root'
})
export class ActiveLoginsService {

  constructor(public httpClient: HttpClient) {
  }

  getActiveLoginsTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<TableColumnsDto>(ApiEndPoint.API_URL + '/tenant_management/sec_get_active_current_logins_v2', searchFilterDto, {observe: 'response'});

  }
}
