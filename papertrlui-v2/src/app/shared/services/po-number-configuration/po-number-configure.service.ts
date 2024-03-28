import {Injectable} from '@angular/core';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {PoNumberFormatDto} from '../../dto/po-number-configuration/po-number-format-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';

@Injectable({
  providedIn: 'root'
})
export class PoNumberConfigureService {

  constructor(public http: HttpClient) {
  }

  getSeparatorList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_separator_list',
      {observe: 'response'}).toPromise();
  }

  createPurchaseOrderNumberFormat(poNumberConfig: PoNumberFormatDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_po_number_format',
      poNumberConfig, {observe: 'response', withCredentials: true});
  }

  updatePoNumberFormat(poNumberFormatDto: PoNumberFormatDto) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_po_number_format', poNumberFormatDto,
      {observe: 'response', withCredentials: true});
  }


  getPoNumberTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_po_number_configuration', searchFilterDto,
      {observe: 'response'});
  }
  getPoNumberData(poId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_configuration', {params: {pocId: poId}, observe: 'response'});
  }

  deletePoNumberFormat(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_po_number_format', {},
      {observe: 'response', params: {id: idParam}});
  }

  isDepartmentPoNoConfigExists(departmentId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_config_exist_by_department', {params: {departmentId}, observe: 'response'}).toPromise();
  }

}
