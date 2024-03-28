import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TrialRequestDto} from '../../dto/auth/trial-request/trial-request-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {ResponseDto} from '../../dto/common/response-dto';

@Injectable({
  providedIn: 'root'
})
export class TrailService {

  constructor(public httpClient: HttpClient) {
  }

  /**
   * This method will get trigger when the user verify the requested trial
   * @param uuid universal identifier for the trial
   */
  public checkEmailAddressAvailability(emailAddress: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_is_email_available',
      {params: {email: emailAddress}, observe: 'response'});
  }

  /**
   * This method will trigger when a user trying to request a free trial
   * @param trialRequestDto request details
   */
  public requestTrial(trialRequestDto: TrialRequestDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_trial_request', trialRequestDto, {
      observe: 'response',
    });
  }

  /**
   * This method will get trigger when the user verify the requested trial
   * @param uuid universal identifier for the trial
   */
  public verifyTrial(id: string) {
    return this.httpClient.get<ResponseDto>(ApiEndPoint.API_URL + '/tenant_management/sec_verify_trial',
      {params: {uuid: id}, observe: 'response'});
  }

  /**
   * This method can used to check the verification percentage
   * @param uuid universal identifier for the trial
   */
  public checkVerificationPercentage(id: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_trial_verify_percentage',
      {params: {uuid: id}, observe: 'response'});
  }
}
