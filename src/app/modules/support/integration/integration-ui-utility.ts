import {IntegrationService} from '../../../shared/services/support/integration.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';


export class IntegrationUiUtility {

  public tenantList: DropdownDto = new DropdownDto();
  public authTypeList: DropdownDto = new DropdownDto();
  public types: DropdownDto = new DropdownDto();
  public tokenTypeList: DropdownDto = new DropdownDto();
  public requestMethodList: DropdownDto = new DropdownDto();
  public serviceNameList: DropdownDto = new DropdownDto();
  public grantTypes: DropdownDto = new DropdownDto();
  public scopes: DropdownDto = new DropdownDto();

  constructor(public integrationManagementService: IntegrationService, public notificationService: NotificationService) {

    this.integrationManagementService.getTenantIdList().subscribe((res: any[]) => {
      this.tenantList.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });

    this.integrationManagementService.getTypes().subscribe((res: any[]) => {
      this.types.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });

    this.integrationManagementService.getAuthTypes().subscribe((res: any[]) => {
        this.authTypeList.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });

    this.integrationManagementService.getGrantTypes().subscribe((res: any[]) => {
        this.grantTypes.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });

    this.integrationManagementService.getScopes().subscribe((res: any[]) => {
        this.scopes.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });

    this.integrationManagementService.getServiceNameList().subscribe((res: any[]) => {
        this.serviceNameList.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }
}
