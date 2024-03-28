import {Injectable} from '@angular/core';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ExpenseTableDto} from '../../dto/expense/expense-table-dto';
import {TaskListDto} from '../../dto/dashboard/task-list-dto';
import {InfoCardsDto} from '../../dto/dashboard/info-cards-dto';
import {ChartDto} from '../../dto/dashboard/chart-dto';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VendorDashboardService {

  constructor(public httpClient: HttpClient) {
  }

  /**
   * Get Approval table Data
   */
  getVendorPaymentTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/vendor-dashboard-payment-column-data.json', {observe: 'response'});
  }

  /**
   * Get Approval data list
   */
  getVendorPaymentTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.get<ExpenseTableDto[]>('assets/demo/data/tables/vendor-dashboard-payment-master-data.json', {observe: 'response'});
  }

  /**
   * Get Approval table Data
   */
  getVendorBillsTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/vendor-dashboard-bill-column-data.json', {observe: 'response'});
  }

  /**
   * Get Approval data list
   */
  getVendorBillsTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.get<ExpenseTableDto[]>('assets/demo/data/tables/vendor-dashboard-bill-master-data.json', {observe: 'response'});
  }

  /**
   * Get to do List
   */
  getToDoList() {
    return this.httpClient.get<TaskListDto[]>('../assets/demo/data/to-do-master-data.json', {observe: 'response'});
  }

  /**
   * Mark task as done
   * @param id id
   */
  taskDone(id) {
    return this.httpClient.post('', {}, {params: id, observe: 'response'});
  }

  /**
   * get info card details
   */
  getInfoCards() {
    return this.httpClient.get<InfoCardsDto>('../assets/demo/data/dashboard-small-cards.json', {observe: 'response'});
  }

  /**
   * get Linear chart data
   */
  getLineChartData() {
    return this.httpClient.get<ChartDto>('../assets/demo/data/dashboard-line.json', {observe: 'response'});
  }

  /**
   * Get Bar chart data
   */
  getBarData() {
    return this.httpClient.get<ChartDto>('../assets/demo/data/dashboard-bar.json', {observe: 'response'});
  }
}
