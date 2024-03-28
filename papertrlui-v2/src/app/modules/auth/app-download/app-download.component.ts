import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Router} from "@angular/router";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-app-download',
  templateUrl: './app-download.component.html',
  styleUrls: ['./app-download.component.scss']
})
export class AppDownloadComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: any, private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      const userAgent = window.navigator.userAgent;
      const deviceDetails = new CommonUtility().detectDevice(userAgent);
      if (deviceDetails){
        if (deviceDetails.device === 'mobile'){
          setTimeout(() => {
            window.location.href = 'https://app.papertrl.com/mobile-download';
          }, 2000);
          // if (deviceDetails.platform === 'ios'){
          //   setTimeout(() => {
          //     window.location.href = 'https://app.papertrl.com/mobile-download';
          //   }, 2000);
          // }
        } else {
          this.router.navigate(['/login']);
        }
      }
    }
  }

  ngOnInit(): void {
    history.pushState(null, null, location.href);
    window.onpopstate = function f(event) {
      history.go(1);
      location.reload();
    };
  }


}

