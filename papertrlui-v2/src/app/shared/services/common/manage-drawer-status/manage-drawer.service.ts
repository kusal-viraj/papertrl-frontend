import { Injectable } from '@angular/core';
import {ApiEndPoint} from "../../../utility/api-end-point";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ManageDrawerService {

  constructor(public httpClient: HttpClient) { }

  /**
   * get default drawer status when init component
   * @param modalName to modal name
   */
  getDefaultDrawerState(modalName) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_drawer_visibility',
      {observe: 'response', withCredentials: true, params: {modalName}});
  }

  /**
   * change default drawer status when change the don't show again check box
   * @param modalName to modal name
   */
  changeDefaultDrawerState(modalName) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_mark_drawer_visibility', {},
      {observe: 'response', withCredentials: true, params: {modalName}});
  }

}
