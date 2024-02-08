import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class TrialManagementService {

  constructor(public httpClient: HttpClient) { }

  getActiveTrialConfig() {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/tenant_management/sec_get_active_trial_config_v2',
      {withCredentials: true});
  }

  getAvailableDBServers(dbClass: string, serverStatus: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_get_supported_db_servers_v2', {},
      {params: {serverName: dbClass, status: serverStatus}, observe: 'response', withCredentials: true});

  }

  getAvailableSftpServers(serverStatus: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_get_supported_sftp_servers_v2', {},
      {params: {status: serverStatus}, observe: 'response', withCredentials: true});

  }

  updateTrialConfig(trialConfig) {
   return  this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_update_trial_config_v2', trialConfig, {observe: 'response'});
  }
}
