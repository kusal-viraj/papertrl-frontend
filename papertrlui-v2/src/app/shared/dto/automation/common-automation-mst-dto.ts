import {AutomationConditionDto} from './automation-condition-dto';
import {CommonAutomationActionDto} from './common-automation-action-dto';

export class CommonAutomationMstDto {

  public id: number;
  public uuid: string;
  public automationName: string;
  public documentType: number;
  public documentEvent: number;
  public createdOn: Date;
  public createdBy: string;
  public updateOn: Date;
  public updateBy: string;
  public deleteOn: Date;
  public deleteBy: string;
  public status: string;
  public setFieldValueDataPatched: boolean;

  public automationConditionConfigs: AutomationConditionDto[] = [];
  public automationActions: CommonAutomationActionDto[] = [];
  ruleAutomation: boolean;

  constructor() {

  }

}
