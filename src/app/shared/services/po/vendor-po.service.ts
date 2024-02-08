import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {BehaviorSubject} from 'rxjs';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {map} from 'rxjs/operators';
import {PoMasterDto} from '../../dto/po/po-master-dto';
import {AuditTrialDto} from '../../dto/common/audit-trial/audit-trial-dto';

@Injectable({
  providedIn: 'root'
})
export class VendorPoService {
  getValues = new BehaviorSubject<any[]>(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Get table columns
   */
  getPoTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/vendor-po-column-data.json', {observe: 'response'});
  }

  /**
   * Get Po List
   * @param searchFilterDto
   * @param venId
   */
  getPoTableData(searchFilterDto: TableSearchFilterDataDto, venId: any) {
    return this.http.get<any[]>('assets/demo/data/vendor-po-master-data.json', {observe: 'response'});
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
  getPoListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-po-bulk-button-data.json', {observe: 'response'});
  }

  getAuditTrial(id) {
    return this.http.get<AuditTrialDto[]>('assets/demo/data/audit-trial.json', {observe: 'response', params: {id}});
  }

  /**
   * this method can be used to view po details
   * @param vendId to vendor id
   * @param poID to po id
   */
  getPoDetailView(vendId, poID){
    return this.http.get<PoMasterDto[]>('', {observe: 'response', params: {id: vendId, poId: poID}});
  }

  /**
   * this method can be used to view report
   * @param idPram to poId
   */
  viewReport(idPram) {
    return this.http
      .get('',
        {
          params: {id: idPram},
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/pdf'})
        };
      }))
      .subscribe(res => {
        const url = window.URL.createObjectURL(res.data);
        window.open(url, '_blank');
      }, error => {
      }, () => {
      });
  }

  /**
   * this method can be used to update po
   * @param poNumber to poNumber
   */
  updatedPo(poNumber){
    return this.http.post('', {observe: 'response', params: {id: poNumber}});
  }

  /**
   * this method can be used to deleteExpense po
   * @param poNumber to poNumber
   */
  deletePo(poNumber){
    return this.http.delete('', {observe: 'response', params: {id: poNumber}});
  }

  /**
   * this method can be used to get po audit trial
   * @param idParam to po id
   */

   getPoAuditTrail(idParam) {
    return this.http.post<string>('',
      {}, {params: {id: idParam}, observe: 'response', withCredentials: true});
  }
}
