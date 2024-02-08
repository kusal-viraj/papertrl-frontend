import {Component, Input, OnInit} from '@angular/core';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {VendorCommunityService} from '../../../shared/services/vendor-community/vendor-community.service';

@Component({
  selector: 'app-vendor-detail-drawer',
  templateUrl: './vendor-detail-drawer.component.html',
  styleUrls: ['./vendor-detail-drawer.component.scss']
})
export class VendorDetailDrawerComponent implements OnInit {


  @Input() vendorId: any;

  constructor(public vendorService: VendorService, public vendorCommunityService: VendorCommunityService, public notificationService: NotificationService) {
  }

  public vendor: VendorMasterDto = new VendorMasterDto();
  public appConstant = new AppConstant();
  public sicCode = [];
  public naicsCode = [];
  public classificationList = [];

  ngOnInit(): void {
    this.getVendorData();
  }

  async getVendorData() {

    await this.vendorService.getVendorsFromCommunity(this.vendorId).then((res) => {
      this.vendor = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));


    this.vendorService.getClassificationList().subscribe((res: any) => {
      if (this.vendor.classificationIdList && this.vendor.classificationIdList.length > 0) {
        res.body.forEach(value => {
          if (this.vendor.classificationIdList.find(x => x === value.id)) {
            this.classificationList.push(value.name);
          }
        })
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  downloadW9(value) {
    value.downloading = true;
    this.vendorCommunityService.downloadW9Form(value.id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', value.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      value.downloading = false;
    }, error => {
      value.downloading = false;
      this.notificationService.errorMessage(error);
    });
  }

  downloadClassification(classification) {
    classification.downloading = true;
    this.vendorService.downloadClassifications(classification.id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', classification.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      classification.downloading = false;
    }, error => {
      classification.downloading = false;
      this.notificationService.errorMessage(error);
    });
  }
}
