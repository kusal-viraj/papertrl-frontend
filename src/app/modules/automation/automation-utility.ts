import {AutomationService} from '../../shared/services/automation-service/automation.service';
import {AppResponseStatus} from '../../shared/enums/app-response-status';
import {NotificationService} from '../../shared/services/notification/notification.service';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';

export class AutomationUtility {


  constructor(public workflowService: AutomationService, public notificationService: NotificationService) {


  }


}
