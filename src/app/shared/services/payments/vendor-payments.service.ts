import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableData} from '../../../../assets/demo/customer';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {BillPaymentMasterDto} from '../../dto/bill-payment/bill-payment-master-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VendorPaymentsService {

  getValues = new BehaviorSubject<any[]>(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Get Columns list
   */
  getPaymentTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/bill-payment-column-data.json', {observe: 'response'});
  }

  /**
   * Get Payment List
   * @param searchValue
   * @param venId
   */
  getPaymentTableData(searchValue: TableSearchFilterDataDto, venId: any) {
    return this.http.get<any[]>('assets/demo/data/bill-payment-master-data.json', {observe: 'response'});
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
  getUserListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/bill-payments-bulk-button-data.json', {observe: 'response'});
  }

}
