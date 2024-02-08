import {DropdownDto} from '../common/dropDown/dropdown-dto';
import {AppConstant} from '../../utility/app-constant';
import {VendorMasterDto} from '../vendor/vendor-master-dto';

export class VCard {
  public id: number;
  public amountStr: string;
  public balanceAmountStr: string;
  public nickName: string;
  public effectiveUntilStr: any;
  public effectiveUntil: any;
  public maxDate: any;
  public createdOnStr: string;
  public cardOwner: string;
  public documentNos: Documents[];
  public cardNumber: any;
  public utilizedAmountStr: any;
  public poNo: any;
  public expireOnStr: any;
  public cardType: any;
  public createdByName: any;
  public contactNumber: any;
  public poId: any;
  public status: any;
  public batchId: any;
  public accountId: any;
  public accountName: any;
  public projectId: any;
  public projectName: any;
  public amount: any;
  public poAmount: any;
}

export class Documents {
  name: string;
  id: number;
  documentType?: number;
}
