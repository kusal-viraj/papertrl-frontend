import {AdditionalFieldOptionDto} from './additional-field-option-dto';
import {DropdownDto} from '../common/dropDown/dropdown-dto';

export class AdditionalFieldDetailDto {

  public id: any;
  public fieldName: string;
  public maxLength: any;
  public displayOrder: any;
  public required: any;
  public moduleId: any;
  public sectionId: any;
  public fieldId: any;
  public status: string;
  public docStatus: string;
  public fieldTypeId: any;
  public fieldTypeName: string;
  public inputTypeId: number;
  public dataType: string;
  public createNew: string;
  public multiple: string;
  public fileTypes: string;
  public rowCount: number;
  public value: string;
  public index: number;
  public dataSourceId: number;
  public readableFileTypes: string;
  public sectionName: string;
  public optionFile: File;
  public fieldValue: any;
  public options: AdditionalFieldOptionDto[] = [];
  public optionsList: DropdownDto = new DropdownDto();
  public removedOptions: any[];
  public docId: any;

}
