import { DropdownDto } from '../common/dropDown/dropdown-dto';

export class ProjectCodeMasterDto {
  public id: number;
  public parentId: number;
  public name: string = '';
  public description: string = '';
  public createdBy: string;
  public creatorName: string = '';
  public createdOn: number;
  public updatedBy: string = '';
  public updatedOn: number;
  public status: string;
  public expenseCategoryId: number;
  public longName: string;
  public expenseCategoryName: string;
  public parentApprovalCodeName: string;
  public contractValue: number;

  public createdDateRange: any;
  public statusList: DropdownDto = new DropdownDto();
  public createdUserList: DropdownDto = new DropdownDto();
  public categoryList: DropdownDto = new DropdownDto();
  startDateStr: any;
  endDateStr: any;
  startDate: any;
  endDate: any;

  constructor() {
    this.statusList.data = [{ id: undefined, name: 'Please Select' }, { id: 'A', name: 'Active' }, { id: 'I', name: 'Inactive' }];
  }
}
