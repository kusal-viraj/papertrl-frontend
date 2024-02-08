import {AdditionalFieldOptionDto} from './additional-field-option-dto';

export class AdditionalFieldDataSourceDto {

  public name: string;
  public optionValues: AdditionalFieldOptionDto[];
  public file: File;

  constructor() {
  }

}
