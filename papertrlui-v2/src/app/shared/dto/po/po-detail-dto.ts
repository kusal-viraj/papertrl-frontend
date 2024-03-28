import {UomDto} from '../item/uom-dto';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';

export class PoDetailDto {

  public id: number;
  public productId: number;
  public qty: number;
  public unit: any;
  public itemName: string;
  public uomId: UomDto = new UomDto();
  public unitPrice: number;
  public discountAmount: number;
  public amount: number;
  public vendorItemNumber: string;
  public additionalData: AdditionalFieldDetailDto [] = new Array();

  constructor() {
  }

}
