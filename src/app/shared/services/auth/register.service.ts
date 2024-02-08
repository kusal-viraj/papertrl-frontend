import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RegisterRequestDto} from '../../dto/auth/vendor-register/register-request-dto';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(public httpClient: HttpClient) { }

  register(registerRequestDto: RegisterRequestDto){
    return this.httpClient.post('', registerRequestDto, {observe: 'response', withCredentials: true});
  }
}
