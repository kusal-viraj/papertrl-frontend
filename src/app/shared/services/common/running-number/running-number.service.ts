import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../../utility/api-end-point';
import {RunningNumberDto} from '../../../dto/common/running-number-dto';

@Injectable({
  providedIn: 'root'
})
export class RunningNumberService {

  constructor(public http: HttpClient) {
  }


  create(runningNumberDto: RunningNumberDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_create_running_number',
      runningNumberDto, {observe: 'response'});
  }

  getDocumentRunningNumber(documentTypeId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_running_number',
      {params: {documentTypeId}, observe: 'response'});
  }

}
