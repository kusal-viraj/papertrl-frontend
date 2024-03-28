import {FilterMetadata, SortMeta} from 'primeng/api';
export class TableSearchFilterDataDto {
  first?: number;
  rows?: number;
  sortField?: string;
  sortOrder?: number;
  multiSortMeta?: SortMeta[];
  filters?: {
    [s: string]: FilterMetadata;
  };
  globalFilter?: any;
}
