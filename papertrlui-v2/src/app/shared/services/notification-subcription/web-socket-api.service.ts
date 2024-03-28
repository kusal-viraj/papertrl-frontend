import {Injectable} from '@angular/core';

// @ts-ignore
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

import {ApiEndPoint} from '../../utility/api-end-point';
import {AppConstant} from '../../utility/app-constant';
import {NotificationDto} from '../../dto/common/notification-dto';
import {NotificationEventEmitterService} from '../common/notification-event-emitter/notification-event-emitter.service';


@Injectable({
  providedIn: 'root'
})
export class WebSocketApiService {

  private webSocketEndPoint = ApiEndPoint.API_URL + '/secured/notification';
  private getMessage = '/user/secured/receive_message';
  private stompClient: any;
  private notifications: NotificationDto[] = [];

  constructor(public notificationEventEmitter: NotificationEventEmitterService) {
  }

  /**
   * This method can be use for connect with websocket
   */
  connect(): void {
    ////////////////////////////
    try {
      const ws = new SockJS(this.webSocketEndPoint + '?access_token=' + localStorage.getItem(AppConstant.ACCESS_TOKEN));
      this.stompClient = Stomp.over(ws);
      this.stompClient.reconnect_delay = 5000;
      // DISABLE STOMP JS DEBUG //
      this.stompClient.debug = null;
      ////////////////////////////
      const that = this;
      ///////////////////////////
      that.stompClient.connect({},
        (frame) => {

          that.stompClient.subscribe(this.getMessage,
            (sdkEvent) => {
              this.notifications = JSON.parse(sdkEvent.body);
              this.notificationEventEmitter.loadNotifications(this.notifications);
            });

          // CALL START ENDPOINT //
          if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)) {
            this.startPortalNotificationService(localStorage.getItem(AppConstant.SUB_CLIENT_ID));
          } else {
            this.startTenantNotificationService();
          }
          ////////////////////////

        }, this.errorCallBack);
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * This method can be use for unsubscribe web socket
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  /**
   * This method can be use for start tenant notification service
   * after call this method backend store tenant id and user id then send notification
   */
  startTenantNotificationService() {
    try {
      this.stompClient.send('/secured/start_tenant_notification_service');
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * This method can be use for end tenant notification service
   * after call this method backend remove tenant id and user id then stop notification
   */
  stopTenantNotificationService() {
    try {
      this.stompClient.send('/secured/stop_tenant_notification_service');
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * This method can be use for start portal notification service
   * after call this method backend store client id and user id then send notification
   */
  startPortalNotificationService(clientId) {
    try {
      this.stompClient.send('/secured/start_portal_notification_service', {}, clientId);
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * This method can be use for end portal notification service
   * after call this method backend remove client id and user id then stop notification
   */
  stopPortalNotificationService(clientId) {
    try {
      this.stompClient.send('/secured/stop_portal_notification_service', {}, clientId);
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * This method can be use for reconnect is websocket not connected
   * @param error websocket error
   */
  errorCallBack(error): void {
    setTimeout(() => {
      this.connect();
    }, 5000);
  }


}
