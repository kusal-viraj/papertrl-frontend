import {DataTableIssueDto} from './data-table-issue-dto';

export class DataTableImportMst {
  public totalRecords: number;
  public succeeded: number;
  public failed: number;
  public issues: DataTableIssueDto[];
}
