import {ReportTypeDto} from './report-type-dto';

export class ReportGroupDto {

  public reportCategory: string;
  public reportTypes: ReportTypeDto[] = [];

  constructor() {
  }

}
