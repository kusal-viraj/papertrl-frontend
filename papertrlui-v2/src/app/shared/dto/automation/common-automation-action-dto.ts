import {CommonAutomationWorkflowConfigDto} from './common-automation-workflow-config-dto';
import {CommonAutomationNotificationConfigDto} from './common-automation-notification-config-dto';
import {CommonAutomationEmailConfigDto} from './common-automation-email-config-dto';
import {CommonAutomationFieldConfigDto} from './common-automation-field-config-dto';
import {CommonAutomationSystemSyncConfigDto} from './common-automation-system-sync-config-dto';
import {CommonAutomationChainConfigDto} from './common-automation-chain-config-dto';
import {CommonAutomationAssignToConfig} from './CommonAutomationAssignToConfig';

export class CommonAutomationActionDto {

  public id: number;
  public shortCode: string;
  public actionName: string;

  public workflowConfigs: CommonAutomationWorkflowConfigDto[] = [];
  public notificationConfig: CommonAutomationNotificationConfigDto = new CommonAutomationNotificationConfigDto();
  public emailConfig: CommonAutomationEmailConfigDto = new CommonAutomationEmailConfigDto();
  public fieldConfig: CommonAutomationFieldConfigDto[] = [];
  public systemSyncConfig: CommonAutomationSystemSyncConfigDto = new CommonAutomationSystemSyncConfigDto();
  public chainConfig: CommonAutomationChainConfigDto = new CommonAutomationChainConfigDto();
  public assignToConfig: CommonAutomationFieldConfigDto = new CommonAutomationFieldConfigDto();


}
