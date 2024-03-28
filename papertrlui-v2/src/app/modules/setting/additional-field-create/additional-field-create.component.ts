import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AdditionalFieldBaseComponent} from '../additional-field-base/additional-field-base.component';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import { ConfirmationService } from 'primeng/api';
import {Menu} from "primeng/menu";


@Component({
  selector: 'app-additional-field-create',
  templateUrl: './additional-field-create.component.html',
  styleUrls: ['./additional-field-create.component.scss']
})
export class AdditionalFieldCreateComponent extends AdditionalFieldBaseComponent implements OnInit {
  selectedDataSourceId: any;
  public removeSpace: RemoveSpace = new RemoveSpace();
  @ViewChild('menu') menu: Menu;
  showExistingAdditionalFields: boolean;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public additionalFieldService: AdditionalFieldService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public confirmationService: ConfirmationService) {

    super(formBuilder, automationService, additionalFieldService, privilegeService, notificationService,
      confirmationService);
  }

  ngOnInit(): void {
  }

  getReadableFleTypes(fileTypes: string) {
    const types = fileTypes.split(',');
    const readableTypes = new Array();
    types.forEach(val => {
      readableTypes.push(this.appConstant.MIME_TYPE_MAP.get(val));
    });
    return readableTypes.toString();
  }


  openDatasourceEditDrawer(selectedDataSourceId) {
    this.dataSourceDrawer = true;
    this.openEditView = true;
    this.selectedDataSourceId = selectedDataSourceId;
  }

  addNewOption() {
    this.openEditView = false;
  }

  onShowExistingAdditionalFields() {
    this.showExistingAdditionalFields = true;
  }
}
