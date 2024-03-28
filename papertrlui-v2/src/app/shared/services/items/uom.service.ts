import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UomDto} from '../../dto/item/uom-dto';
import {ItemMasterDto} from '../../dto/item/item-master-dto';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class UomService {
  constructor(private httpClient: HttpClient) {
  }

  createUOMService(uomDto: UomDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_uom',
      uomDto, {observe: 'response', withCredentials: true});
  }


  getUOMAvailability(nameParam: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_availability',
      {params: {name: nameParam}, observe: 'response', withCredentials: true});
  }

}
