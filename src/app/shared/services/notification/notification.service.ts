import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';
import {TimeOutEnum} from '../../enums/time-out-enum';
import {AppResponseStatus} from '../../enums/app-response-status';
import {AppResponseMessage} from '../../enums/app-response-message';
import {AppConstant} from '../../utility/app-constant';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(public messageService: MessageService) {
  }

  successMessage(SUCCESS_MESSAGE) {
    this.messageService.add({
      key: 'main', severity: 'success', summary: 'Success',
      detail: SUCCESS_MESSAGE, life: TimeOutEnum.TOAST_HIDE_TIME_OUT
    });
  }

  errorMessage(ERROR_MESSAGE) {
    try {
      if (ERROR_MESSAGE instanceof Blob){
        return;
      }
      if (ERROR_MESSAGE.toString().includes('TypeError:')) {
        return;
      }
    } catch (e) {
    }

    try {
      if (ERROR_MESSAGE.status === AppConstant.FORBIDDEN) {
        this.messageService.add({
          key: 'main', severity: 'error', summary: 'Something Went Wrong',
          detail: ERROR_MESSAGE, life: TimeOutEnum.TOAST_HIDE_TIME_OUT
        });
        return;
      }


      if (ERROR_MESSAGE.status === AppResponseStatus.STATUS_UNAUTHORIZED || ERROR_MESSAGE.error === AppResponseMessage.INVALID_TOKEN) {
        return;
      } else {
        this.messageService.add({
          key: 'main', severity: 'error', summary: 'Something Went Wrong',
          detail: ERROR_MESSAGE, life: TimeOutEnum.TOAST_HIDE_TIME_OUT
        });
      }
    } catch (e) {
      this.messageService.add({
        key: 'main', severity: 'error', summary: 'Something Went Wrong',
        detail: ERROR_MESSAGE, life: TimeOutEnum.TOAST_HIDE_TIME_OUT
      });
    }
  }

  infoMessage(INFO_MESSAGE) {
    this.messageService.add({
      key: 'main', severity: 'warn', summary: 'Attention Please',
      detail: INFO_MESSAGE, life: TimeOutEnum.TOAST_HIDE_TIME_OUT
    });
  }

  clear(){
    this.messageService.clear('main');
  }
}
