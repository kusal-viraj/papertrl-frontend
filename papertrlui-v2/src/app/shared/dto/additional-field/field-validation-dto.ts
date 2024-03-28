import {DocumentTypeFieldDto} from './document-type-field-dto';

export class FieldValidationDto{
  public id: number;
  public enable: boolean;
  public fieldId: number;
  public fieldName: string;
  public documentTypeFieldConfig: DocumentTypeFieldDto[];
}
