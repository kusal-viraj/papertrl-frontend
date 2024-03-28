import {UomDto} from "../item/uom-dto";

export class CreditNoteItemDetail{
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

  constructor() {
  }
}
