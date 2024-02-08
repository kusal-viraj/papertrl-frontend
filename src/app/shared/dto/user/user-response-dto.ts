import {DropdownDto} from '../common/dropDown/dropdown-dto';

export class UserResponseDto {

  userId: string;
  firstLastName: string;
  employeeNumber: string;
  profile: File;
  approvalGroup = new DropdownDto();
  role = new DropdownDto();
  status = new DropdownDto();
  password: string;
  confirmPassword: string;

  constructor() {
  }

}
