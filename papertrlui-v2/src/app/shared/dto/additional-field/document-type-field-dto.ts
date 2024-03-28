import {SectionConfigDto} from './section-config-dto';

export class DocumentTypeFieldDto{
  public id: number;
  public fieldId: number;
  public documentId: number;
  public enable: boolean;
  public documentName: string;
  public sectionConfig: SectionConfigDto[];
}
