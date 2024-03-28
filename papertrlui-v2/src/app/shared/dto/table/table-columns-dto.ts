import {MultiSelectValueDto} from '../common/dropDown/multi-select-value-dto';
import {DropdownDto} from '../common/dropDown/dropdown-dto';

export class TableColumnsDto {
  columns: TableColumns [];
  state: State;
}

export class TableColumns {
  field: any;
  header: any;
  visible: boolean;
  columnShow: boolean;
  isSortable: boolean;
  isReOrderable: boolean;
  isReSizable: boolean;
  canHide: boolean;
  align: string;
  searchType: string;
  placeholder: boolean;
  dropdownValues: DropdownDto [];
  multiSelectValues: MultiSelectValueDto[];
}

export class State {
  first: number;
  rows: number;
  columnWidths: string;
  columnOrder: [];
}
