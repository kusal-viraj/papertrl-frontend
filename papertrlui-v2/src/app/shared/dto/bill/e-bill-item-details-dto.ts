import {UomDto} from '../item/uom-dto';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';

export class EBillItemDetailsDto {
  public id: number;
  public productId: number;
  public qty: number;
  public itemName: string;
  public uomId: UomDto = new UomDto();
  public unitPrice: number;
  public discountAmount: number;
  public amount: number;
  public poReceiptId: number;
  public additionalData: AdditionalFieldDetailDto [] = new Array();

  constructor() {
  }
}
