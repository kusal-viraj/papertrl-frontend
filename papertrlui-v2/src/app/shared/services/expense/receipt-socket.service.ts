import {Injectable} from '@angular/core';
import {ApiEndPoint} from "../../utility/api-end-point";
import {AppConstant} from "../../utility/app-constant";
// @ts-ignore
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import {BehaviorSubject} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ReceiptSocketService {
  private webSocketEndPoint = ApiEndPoint.API_URL + '/secured/ocr_receipt';
  private getMessage = '/user/secured/receive_receipt_ocr_status';
  private stompClient: any;
  public behaviorSubject = new BehaviorSubject([])

  constructor() {
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
      this.stompClient.connect({},
        (frame) => {
          this.stompClient.subscribe(this.getMessage,
            (sdkEvent) => {
              this.behaviorSubject.next(JSON.parse(sdkEvent.body));
            });

          // CALL START ENDPOINT //
          this.configReceiptWebSocketConnection(true);
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
  configReceiptWebSocketConnection(status) {
    let client = null;
    if (localStorage.getItem(AppConstant.SUB_CLIENT_ID)){
      client = localStorage.getItem(AppConstant.SUB_CLIENT_ID);
    }
    let body = JSON.stringify({connect: status, clientId: client})
    try {
      this.stompClient.send('/secured/config_receipt_web_socket_connection', {}, body);
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
