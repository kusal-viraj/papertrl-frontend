import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {TaskSettingsService} from '../../../../shared/services/support/task-settings-service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';

export class TaskUtility {
  public tenantIdList: DropdownDto = new DropdownDto();
  public commonUrlIdList: DropdownDto = new DropdownDto();

  constructor(public taskSettingsService: TaskSettingsService, withAlltenentIds: boolean, public notificationService: NotificationService){
    this.getTentIds(this.tenantIdList, withAlltenentIds);
    this.getCommonUrl(this.commonUrlIdList);
  }


  /**
   * this method can be used get tenant ids
   * @param listInstance to dropdown instance
   * @param withAlltenentIds to boolean
   */
  getTentIds(listInstance: DropdownDto, withAlltenentIds){
    this.taskSettingsService.getTenantIdList().subscribe((res: any) => {
        listInstance.data = res.body;
        if (!withAlltenentIds) {
          listInstance.data.splice(0, 1);
        }
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * this method can be used to get urls
   * @param listInstance to dropdown instance
   */
  getCommonUrl(listInstance: DropdownDto){
    this.taskSettingsService.getCommonUrlIdList().subscribe((res: any) => {
        listInstance.data = res.body;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }
}
