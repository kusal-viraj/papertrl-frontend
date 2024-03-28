import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';

@Injectable({
  providedIn: 'root'
})
export class VendorGrnService {

  getValues = new BehaviorSubject<any[]>(null);

  constructor(private http: HttpClient) {
  }

  /**
   * Get Table Columns
   */
  getGrnTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/pr-column-data.json', {observe: 'response'});
  }

  /**
   * Get Grn List
   * @param searchFilterDto
   * @param venId
   */
  getGrnTableData(searchFilterDto: TableSearchFilterDataDto, venId: any) {
    return this.http.get<any[]>('assets/demo/data/pr-master-data.json', {observe: 'response'});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.http.put<any[]>('', {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getGrnListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/po-receipt-bulk-button-data.json', {observe: 'response'});
  }
}
