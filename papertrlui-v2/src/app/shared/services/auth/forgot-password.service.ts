import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {ForgotPasswordResetRequestDto} from '../../dto/auth/forogot-password-reset/forgot-password-reset-request-dto';
import {ResponseDto} from '../../dto/common/response-dto';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  constructor(public httpClient: HttpClient) {
  }

  public forgotPasswordResetRequest(forgotPasswordResetRequestDto: ForgotPasswordResetRequestDto) {
    return this.httpClient.put<ResponseDto>(ApiEndPoint.API_URL + '/user_management/sec_forget_password_reset',
      forgotPasswordResetRequestDto, {observe: 'response'});
  }

}
