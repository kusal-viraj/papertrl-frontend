import {Component, OnInit} from '@angular/core';
import {TrailService} from '../../../shared/services/auth/trail.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ActivatedRoute} from '@angular/router';
import {PrivilegeService} from "../../../shared/services/privilege.service";

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {

  public isVisibleProgressContent: boolean;
  public isVisibleCongratulationContent: boolean;
  public isVisibleErrorContent: boolean;
  public somethingWentWrong: boolean;
  public verificationPercentage = 0;
  public passwordResetUrl = AppConstant.EMPTY_STRING;
  public infoMessage = '';

  constructor(public activatedRoute: ActivatedRoute, public trialService: TrailService) {
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

    if (undefined === queryParams.id) {
      this.somethingWentWrong = true;
      this.isVisibleProgressContent = false;
      return;
    }

    const intervalId = setInterval(() => {
      this.updateThePercentage(queryParams.id);
    }, 3000);


    this.trialService.verifyTrial(queryParams.id).subscribe((res) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.passwordResetUrl = res.body.message;
        this.isVisibleProgressContent = false;
        this.isVisibleCongratulationContent = true;
        this.verificationPercentage = 100.0;
        clearInterval(intervalId);

      } else {
        this.isVisibleProgressContent = false;
        this.infoMessage = res.body.message;
        this.isVisibleErrorContent = true;
        clearInterval(intervalId);
      }

    }, error => {
      this.somethingWentWrong = true;
      this.isVisibleProgressContent = false;
      clearInterval(intervalId);
    });
  }

  public updateThePercentage(id: string) {
    this.trialService.checkVerificationPercentage(id).subscribe((res) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.verificationPercentage = Number(res.body);
      }
    });
  }
}
