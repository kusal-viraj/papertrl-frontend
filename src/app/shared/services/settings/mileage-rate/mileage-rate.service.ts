import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiEndPoint} from "../../../utility/api-end-point";
import {TableSearchFilterDataDto} from "../../../dto/table/table-search-filter-data-dto";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MileageRateService {

  public mileageRate = new BehaviorSubject(null);

  constructor(public httpClient: HttpClient) {
  }

  /**
   * this method can be used to create mileage rate
   * @param vpExpenseMileageRate to mileage rate object
   */
  createMileageRate(vpExpenseMileageRate) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_expense_mileage_rate',
      vpExpenseMileageRate, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to get configured mileage rate
   * date to expense date
   */
  getMileageRate(date) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_expense_mileage_rate',
      {params: {expenseDateStr: date}, observe: 'response', withCredentials: true});
  }

  /**
   * search table data
   * @param searchFilterDto to search filter object
   */
  getMileageTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_search_expense_mileage_rate', searchFilterDto,
      {observe: 'response'});
  }

}
