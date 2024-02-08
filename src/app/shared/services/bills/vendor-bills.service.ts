import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {AuditTrialDto} from '../../dto/common/audit-trial/audit-trial-dto';


@Injectable({
  providedIn: 'root'
})
export class VendorBillsService {

  getValues = new BehaviorSubject(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Table Column Data
   */
  getInvoiceTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/vendor-invoice-column-data.json', {observe: 'response'});
  }

  /**
   * Get Bill List
   * @param vendorId
   * @param venId
   */
  getInvoiceTableData(vendorId: any, venId: any) {
    return this.http.get<any[]>('assets/demo/data/vendor-invoice-master-data.json', {observe: 'response'});
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
  getBillListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/bills-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Bill Audit Trial
   */
  getAuditTrial(id) {
    return this.http.get<AuditTrialDto[]>('assets/demo/data/audit-trial.json', {observe: 'response', params: {id}});
  }

}
