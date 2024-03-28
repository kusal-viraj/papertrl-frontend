import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {MessageService} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonMessage} from '../../../shared/utility/common-message';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {UserService} from '../../../shared/services/user/user.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DepartmentService} from "../../../shared/services/department/department.service";
import {BillsService} from '../../../shared/services/bills/bills.service';


export class UserUtility {
  public approvalGroups: DropdownDto = new DropdownDto();
  public statusList: DropdownDto = new DropdownDto();
  public departments;

  constructor(public messageService: MessageService, public userService: UserService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public departmentService: DepartmentService, public billsService: BillsService) {
    this.statusList.data = [{id: 'A', name: 'Active'}, {id: 'I', name: 'Inactive'}];
  }


  /**
   * get approval groups
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   * @param isCreate
   */
  getApprovalGroupsWithNoApproval(listInstance: DropdownDto, isAddNew, isCreate) {
    if (this.privilegeService.isVendor()) {
      return;
    }
    this.userService.getApprovalGroupsWithNoApproval(isCreate).subscribe((res: any) => {
      listInstance.data = (res.body);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used for get department list and this method not support with vendor and support tenants
   * @private
   */

  getDepartmentData() {
    if (this.privilegeService.isVendor() || this.privilegeService.isSupport()) {
      return;
    }
    this.departmentService.getDepartmentList().subscribe((res: any) => {
      this.departments = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }


  isValidFile(event, userDto: UserMasterDto) {
    userDto.profilePic = event.target.files[0];
    if ((userDto.profilePic.size / 1024 / 1024) > AppConstant.MAX_PROPIC_SIZE) {
      userDto.profilePic = null;
      this.notificationService.infoMessage(CommonMessage.INVALID_IMAGE_SIZE);
      return false;
    } else {
      const contentType: string = userDto.profilePic.type;
      if (!AppConstant.SUPPORTING_PRO_PIC_TYPES.includes(contentType)) {
        userDto.profilePic = null;
        this.notificationService.infoMessage(CommonMessage.INVALID_PRO_PIC_TYPE);
        return false;
      }
    }
    return true;
  }
}
