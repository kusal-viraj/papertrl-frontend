import {Component, Input, OnInit} from '@angular/core';
import {PoMasterDto} from "../../../shared/dto/po/po-master-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {PoService} from "../../../shared/services/po/po.service";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {VendorService} from "../../../shared/services/vendors/vendor.service";

@Component({
  selector: 'app-table-vendor-overlay',
  templateUrl: './table-vendor-overlay.component.html',
  styleUrls: ['./table-vendor-overlay.component.scss']
})
export class TableVendorOverlayComponent implements OnInit {

  public vendorDto: any;
  public enums = AppEnumConstants;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() vendorId;

  constructor(public vendorService: VendorService) {
  }

  ngOnInit(): void {
    this.vendorService.getSummaryVendor(this.vendorId).subscribe((res) => {
      this.vendorDto = res.body;
    });
  }

}
