import {Component} from '@angular/core';
import {ApiEndPoint} from './shared/utility/api-end-point';

// tslint:disable-next-line:ban-types
declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'papertrlui';

  constructor() {
    gtag('config', ApiEndPoint.GOOGLE_ANALYTICS_TRACK_ID, {app_version: ApiEndPoint.ENVIRONMENT});
  }
}
