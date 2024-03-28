import {Injectable, EventEmitter} from '@angular/core';
import {Subscription} from 'rxjs';
import {NotificationDto} from '../../../dto/common/notification-dto';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  invokeSubAccountFunction = new EventEmitter();
  portalSubAccountsSubscription: Subscription;

  constructor() {
  }

  loadSubAccounts() {
    this.invokeSubAccountFunction.emit();
  }

}
