import {DropdownDto} from '../common/dropDown/dropdown-dto';
import {AppConstant} from '../../utility/app-constant';
import {VendorMasterDto} from '../vendor/vendor-master-dto';

export class UserMasterDto {

  public id: number;
  showRemit: boolean;
  public isUidAvailable: true;
  public roleId: number;
  public roleIdList: number[];
  public userName: string = AppConstant.EMPTY_STRING;
  public name: string = AppConstant.EMPTY_STRING;
  public address: string = AppConstant.EMPTY_STRING;
  public proPicPath: string = AppConstant.EMPTY_STRING;
  public propicId: number;
  public proPicName: string = AppConstant.EMPTY_STRING;
  public proPicContentType: string = AppConstant.EMPTY_STRING;
  public email: string = AppConstant.EMPTY_STRING;
  public telephoneNo: any = AppConstant.EMPTY_STRING;
  public status: string;
  public loginAttempt: number;
  public dateCreated: number;
  public lastLoginDate: number;
  public createdUser: string;
  public nicPassportNo: string;
  public imageAttached: string;
  public approvalGroups: number[] = [3];
  public approvalGroupNames: string[] = new Array();
  public userType: string;
  public firstLogin: string;
  public accountLockedDate: number;
  public lastUpdatedBy: string;
  public lastUpdatedOn: number;
  public password: string;
  public temporaryPassword: string;
  public oldPassword: string;
  public confirmPassowrd: string;
  public profilePic: File;
  public approvalGroupList: DropdownDto = new DropdownDto();
  // public workflowList: DropDownDataDto = new DropDownDataDto();
  public vendorList: DropdownDto = new DropdownDto();
  public roleList: DropdownDto = new DropdownDto();
  public statusList: DropdownDto = new DropdownDto();
  public userTypeList: DropdownDto = new DropdownDto();
  public vendorId = new VendorMasterDto();
  public roleName = AppConstant.EMPTY_STRING;
  public accessLevelName = AppConstant.EMPTY_STRING;
  public messageCount = 0;
  public createdOn: Date;
  public lastLogin: Date;
  public navs: any[] = new Array();
  public proficServerPath: any = AppConstant.EMPTY_STRING;
  public authorityList: string[] = new Array();
  public departments: any[];

  constructor() {
  }
}
