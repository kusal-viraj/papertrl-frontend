import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PoMasterDto} from '../../dto/po/po-master-dto';

@Injectable({
  providedIn: 'root'
})
export class PoOverlayService {

  constructor(public http: HttpClient) { }

  getPo(billId: any) {
    return this.http.get<PoMasterDto>('assets/demo/data/po-overlay-data.json', {observe: 'response'});
  }
}
