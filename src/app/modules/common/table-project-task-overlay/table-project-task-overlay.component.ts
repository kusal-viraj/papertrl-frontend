import {Component, Input, OnInit} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {PoService} from "../../../shared/services/po/po.service";
import {ProjectCodeService} from "../../../shared/services/project-code/project-code.service";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";

@Component({
  selector: 'app-table-project-task-overlay',
  templateUrl: './table-project-task-overlay.component.html',
  styleUrls: ['./table-project-task-overlay.component.scss']
})
export class TableProjectTaskOverlayComponent implements OnInit {

  public projectDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() id;

  constructor(public projectCodeService: ProjectCodeService) {
  }

  ngOnInit(): void {
    this.projectCodeService.getProjectDetails(this.id).subscribe((res) => {
      this.projectDto = res.body;
    });
  }

  getStatus(status) {
    switch (status) {
      case AppEnumConstants.STATUS_LETTER_INACTIVE: {
        return AppEnumConstants.LABEL_INACTIVE;
      }
      case AppEnumConstants.STATUS_APPROVED: {
        return AppEnumConstants.LABEL_ACTIVE;
      }
    }
  }
}
