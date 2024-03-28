import { Injectable } from '@angular/core';
import {OnTheFlyVendorCreateDto} from '../../dto/vendor/on-the-fly-vendor-create-dto';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AddVendorService {

  constructor(public httpClient: HttpClient) { }

  createVendor(onTheFlyVendorRequestDto: OnTheFlyVendorCreateDto) {
    return this.httpClient.post('', onTheFlyVendorRequestDto, {observe: 'response', withCredentials: true});
  }
}
