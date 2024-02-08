import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NotificationDto} from '../../../dto/common/notification-dto';

@Injectable({
  providedIn: 'root'
})
export class NotificationEventEmitterService {

  invokeLoadNotifications = new EventEmitter();
  notificationsSubscription: Subscription;

  constructor() {
  }

  loadNotifications(notifications: NotificationDto[]) {
    this.invokeLoadNotifications.emit(notifications);
  }
}
