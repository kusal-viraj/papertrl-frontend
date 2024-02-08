import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';

export class PoAccountDetailDto {
  public id: number;
  public accountId: number;
  public amount: number;
  public projectId: any;
  public poReceiptId: number;
  public additionalData: AdditionalFieldDetailDto [] = new Array();

}
