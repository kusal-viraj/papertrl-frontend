import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../../shared/utility/api-end-point';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {FieldValidationDto} from '../../../shared/dto/additional-field/field-validation-dto';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-field-validation',
  templateUrl: './field-validation.component.html',
  styleUrls: ['./field-validation.component.scss']
})
export class FieldValidationComponent implements OnInit {

  fields: FieldValidationDto[] = [];
  constructor(public additionalFieldService: AdditionalFieldService, public notificationService: NotificationService) { }

  ngOnInit(): void {
    this.additionalFieldService.getMandatoryFieldForConfig().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.fields = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }

  /**
   * This method will call API when user toggle switch related to the field
   */
  onChangeField(){
    this.updateConfig();
  }

  /**
   * This method will tick or untick all section options when user tick or untick module
   * @param module
   */
  onChangeModule(module){
    module.sectionConfig.forEach(e => {
      e.enable = module.enable;
    });
    this.updateConfig();
  }

  /**
   * This method will tick module option if user tick at least one section option and will untick if user untick all section
   * @param section
   * @param module
   */
  onChangeSection(section, module) {
    if (section.enable){
      module.enable = true;
    }else{
      if (!(!!module.sectionConfig.find(e => e.enable))){
        module.enable = false;
      }
    }
    this.updateConfig();
  }

  /**
   * this method will call when user make any changes in configuration
   */
  updateConfig(){
    this.additionalFieldService.updateMandatoryField(this.fields).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.notificationService.infoMessage(res.body.message);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }


}
