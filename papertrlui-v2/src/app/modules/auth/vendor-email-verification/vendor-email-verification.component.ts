import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ActivatedRoute, Router} from '@angular/router';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-vendor-email-verification',
  templateUrl: './vendor-email-verification.component.html',
  styleUrls: ['./vendor-email-verification.component.scss']
})
export class VendorEmailVerificationComponent implements OnInit {

  public isVisibleProgressContent: boolean;
  public isVisibleCongratulationContent: boolean;
  public isVisibleErrorContent: boolean;
  public somethingWentWrong: boolean;
  public verificationPercentage = 0;
  public passwordResetUrl = AppConstant.EMPTY_STRING;

  constructor(public router: Router, public activatedRoute: ActivatedRoute, public vendorService: VendorService,
              @Inject(PLATFORM_ID) private platformId: any) {
    this.isVisibleProgressContent = true;
  }

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.verify(queryParams);
  }

  /**
   * This method will get trigger when the user clicks on the trial verification link
   * @param queryParams uuid
   */
  public verify(queryParams) {
    this.verificationPercentage = 100;

    if (undefined === queryParams.uuid) {
      this.somethingWentWrong = true;
      this.isVisibleProgressContent = false;
      return;
    }

    this.vendorService.confirmVendorRegistration(queryParams.uuid).subscribe((res) => {

      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.passwordResetUrl = res.body.message;
        this.isVisibleProgressContent = false;
        this.isVisibleErrorContent = false;
        // this.isVisibleCongratulationContent = true;
        this.verificationPercentage = 100;
        
        setTimeout(() =>
          this.isVisibleCongratulationContent = true,
        1000);

      } else {
        this.isVisibleProgressContent = false;
        this.isVisibleErrorContent = true;
      }

    }, error => {
      this.somethingWentWrong = true;
      this.isVisibleErrorContent = false;
      this.isVisibleProgressContent = false;
    });
  }


}


