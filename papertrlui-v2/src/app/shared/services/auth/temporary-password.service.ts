import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TemporaryPasswordRequestDto} from '../../dto/auth/tempory-password/temporary-password-request-dto';
import {ResponseDto} from '../../dto/common/response-dto';

@Injectable({
  providedIn: 'root'
})
export class TemporaryPasswordService {

  constructor(public httpClient: HttpClient) {
  }

  public createNewPassword(temporaryPasswordRequestDto: TemporaryPasswordRequestDto) {
    return this.httpClient.put<ResponseDto>(ApiEndPoint.API_URL + '/user_management/sec_temporary_password_reset',
      temporaryPasswordRequestDto, {observe: 'response', withCredentials: true});
  }
}
