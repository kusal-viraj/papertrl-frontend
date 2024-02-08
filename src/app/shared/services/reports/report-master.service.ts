import {Injectable} from '@angular/core';
import {AuditTrialDto} from '../../dto/common/audit-trial/audit-trial-dto';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {map} from 'rxjs/operators';
import {ReportFilterDto} from '../../dto/report/report-filter-dto';
import {TableColumnsDto} from "../../dto/table/table-columns-dto";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReportMasterService {

  public poBillableTransActionListLength = new BehaviorSubject<number>(0);
  public billBillableTransActionListLength = new BehaviorSubject<number>(0);
  public expenseBillableTransActionListLength = new BehaviorSubject<number>(0);
  public transactionTypes = new BehaviorSubject<any []>([]);
  public isProgressPO = new BehaviorSubject<boolean>(false);
  public isProgressBill = new BehaviorSubject<boolean>(false);
  public isProgressExpense = new BehaviorSubject<boolean>(false);


  constructor(public http: HttpClient) {
  }

  /**
   * this method can be used to get report name list
   */
  getReportTypes() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_report_types',
      {observe: 'response'});
  }

  /**
   * this method can be used to get report name list
   */
  getReportFilters(reportTypeId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_report_filters',
      {observe: 'response', params: {reportTypeId}});
  }

  /**
   * this method can be used to get country list
   */
  getCountriesList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_countries',
      {observe: 'response'});
  }

  getCitiesList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_cities',
      {observe: 'response'});
  }

  /**
   * this method can be used to get approved by list
   */
  getAgingList() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/report/aging-data.json',
      {observe: 'response'});
  }

  /**
   * This method can be used to get custom field list
   */
  getCustomFieldList() {
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_detail_section_additional_fields_v2',
      {observe: 'response'});
  }

  /**
   * This method can be use for get trans action type list
   */
  getTransActionTypeList() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/report/transaction-type.json',
      {observe: 'response'});
  }

  /**
   * This method can be use for get status list
   */
  getStatusList() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/report/status-list.json',
      {observe: 'response'});
  }


  /**
   * this method can be used to get vendor detail report pdf view
   * @param reportFilterDto reportFilterDto;
   */
  viewReport(reportUrl, reportFilterDto: ReportFilterDto) {
    return this.http.post(ApiEndPoint.API_URL + reportUrl, reportFilterDto,
      {
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  /**
   * this method can be used to export report
   * @param reportFilterDto reportFilterDto
   */

  exportReport(exportUrl, reportFilterDto) {
    return this.http.post(ApiEndPoint.API_URL + exportUrl, reportFilterDto,
      {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'text/plain'})
        };
      }));
  }


  /**
   * function used to get po billable transaction details
   */
  getPoBillableTableData(){
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_billable_po_transactions_report',
      {observe: 'response', withCredentials: true});
  }

  /**
   * function used to get bill- billable transaction details
   */
  getBillBillableTableData(){
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_billable_bill_transactions_report',
      {observe: 'response', withCredentials: true});
  }

  /**
   * function used to get expense- billable transaction details
   */
  getExpenseBillableTableData(){
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_billable_expense_transactions_report',
      {observe: 'response', withCredentials: true});
  }
}
