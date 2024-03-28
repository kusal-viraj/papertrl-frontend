import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TenantDto} from '../../dto/tenant/tenant-dto';

@Injectable({
  providedIn: 'root'
})
export class TenantServiceService {

  constructor(public httpClient: HttpClient) {
  }


}
