import {TableDataOptionsDto} from '../dto/table/table-data-options-dto';
import {TableSearchFilterDataDto} from '../dto/table/table-search-filter-data-dto';
import {AppTableKeysData} from '../enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppEnumConstants} from '../enums/app-enum-constants';
import {AppConstant} from './app-constant';
import {Menu} from 'primeng/menu';
import {Observable, Subject} from "rxjs";


export class TableSupportBase  {

  public tableDataOptions: TableDataOptionsDto = new TableDataOptionsDto();
  public searchFilterDto: TableSearchFilterDataDto = new TableSearchFilterDataDto();
  public appConstant: AppConstant = new AppConstant();
  public dataSource: any;
  public selectedColumnCount: any;

  public totalRecords: number; // Number Of Total Record for Pagination
  public rows: any[] = []; // Shows the selected Columns
  public filterArray: any[] = []; // Columns with advanced filter
  public activeFilters: any[] = []; // List of Filters Currently Active
  public hiddenInOptions: any[] = []; // Columns Selected to DropDown
  public filterEnabledColumns: any[] = []; // Filters to display even if column is hidden
  public selectedColumns: any[] = [];
  public tableActionList: any [] = [];  // Action Button
  public menu: Menu;

  public isVisibleTable = false;
  public isDisabledValue = false;
  public isTableInResponsive: boolean;

  public loading = true; // Loader on Table for Lazy Event
  public firstLoad = true;
  public selectedContextActionData: any; // Selected Context action table row
  public contextMenuActionList: any; // Context Menu Action list
  public hideMenu: boolean;
  public minWidth = false;
  public filterSubject = new Subject();
  public filterObserver = this.filterSubject.asObservable();
  constructor() {
  }

  /**
   * Loads Table Data (Settings)
   */
  tableDataProcess(table: Table, tableData, key, columnSelect) {
    this.loading = true;
    this.minWidth = false;

    // tableData.body.state.columnWidths = '53,600,201,198,200,204,199,205,212,203,204,208,206,203,203,205,205,209,213,205,205,204,202,204,201,204,204,55';
    // this.tableDataOptions.columnWidths = tableData.body.state.columnWidths;
    // const columnWidthsArray = tableData.body.state.columnWidths.split(',');
    // tableData.body.state.tableWidth = columnWidthsArray.reduce((a, b) => {
    //   return parseInt(a) + parseInt(b);
    // }, 0);
    // Set Table Setting to Session Storage from DB
    sessionStorage.setItem(key, JSON.stringify(tableData.body.state));
    // this.minWidth = tableData.body.state.tableWidth;
    this.minWidth = true;

    if (this.firstLoad) {
      this.firstLoad = false;
    } else {
      table.restoreState();
      table.restoreColumnOrder();
      table.restoreColumnWidths();
    }
    // Restore Column Order form Session Storage
    // setTimeout(() => {
    //   table.restoreColumnOrder();
    // }, AppTableKeysData.RESTORE_COLUMN_ORDER_TIME_OUT);

    // Restore Column Widths form Session Storage
    // setTimeout(() => {
    //   try {
    //     this.changeFilterSelectionLabel(columnSelect.value);
    //   } catch (e) {
    //   }
    //   table.restoreState();
    //   table.restoreColumnWidths();
    // }, AppTableKeysData.RESTORE_COLUMN_WIDTHS_TIME_OUT);

    const tempArr: any[] = [];
    const tempArr1: any[] = [];
    const tempArr2: any[] = [];
    const tempArr3: any[] = [];
    for (const i of tableData.body.columns) {
      if (i.columnShow === true) {
        tempArr.push(i);
      }
      if (i.canHide === true) {
        tempArr1.push(i);
      }
      if (i.filterShow === true) {
        tempArr3.push(i);
      }
    }
    for (const i of tableData.body.advancedFilters) {
      tempArr2.push(i);
    }

    this.hiddenInOptions = tempArr1;
    this.selectedColumns = tempArr;
    this.filterArray = tempArr2;
    this.filterEnabledColumns = tempArr3;
    // Clear Table Session State
    setTimeout(() => {
      this.loading = false;
      sessionStorage.removeItem(key);
    }, AppTableKeysData.REMOVE_TABLE_ITEM_TIME_OUT);
  }


  /**
   * Calls when column order, column width changed or columns hide or shown
   */
  tableChanged(table: Table, key: any) {
    return new Promise(returnVal => {
      table.saveState();

      setTimeout(() => {
        const obj = JSON.parse(sessionStorage.getItem(key));
        if (obj) {
          sessionStorage.setItem(key, JSON.stringify(obj));
          this.tableDataOptions.columnOrder = obj.columnOrder;
          this.tableDataOptions.columnWidths = obj.columnWidths;
          this.tableDataOptions.tableWidth = obj.tableWidth;
          this.tableDataOptions.shownColumn = this.selectedColumns;
          this.loading = false;

          try {
            const tempArr = this.hiddenInOptions;
            const indexMap = new Map();
            table._columns.forEach((item, index) => {
              indexMap.set(item.field, index);
            });

            tempArr.sort((item1, item2) => {
              const index1 = indexMap.get(item1.field);
              const index2 = indexMap.get(item2.field);

              if (index1 !== undefined && index2 !== undefined) {
                return index1 - index2;
              } else if (index1 !== undefined) {
                return -1; // item1 should come before item2
              } else if (index2 !== undefined) {
                return 1; // item2 should come before item1
              } else {
                return 0; // both items are not in array a, maintain their relative order
              }
            });

            this.hiddenInOptions = [];
            this.hiddenInOptions = [...tempArr];

          } catch (e) {

          }

          setTimeout(() => {
            // sessionStorage.removeItem(key);
          }, 100);

          returnVal(this.tableDataOptions);
        }
      }, AppTableKeysData.TABLE_CHANGES_TIME_OUT);
    });
  }


  /**
   * Change Columns
   */
  columnChange(val: any[]) {
    this.loading = true;
    this.selectedColumns = val;
  }

  /**
   * Date Selected
   * @param value not formatted date
   * @param field to field
   */
  onDateSelect(table, value, field) {
    const dateStr = [];
    dateStr[0] = value[0].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    if (value[1] != null) {
      dateStr[1] = value[1].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } else {
      dateStr[1] = null;
    }
    table.filter(dateStr, field, 'contains');
  }

  /**
   * Multi select value changed
   * @param event value
   * @param field field name
   */
  onMultiSelectChange(table, event, field: any) {
    table.filter(event.value, field, 'contains');
  }

  /**
   * Calls when filter done
   */
  onFilter(table) {
    this.filterSubject.next(true);
    // this.activeFilters = [];
    // for (const i of this.filterArray) {
    //   if (Array.isArray(table.filters[i.field])) {
    //     if (table.filters[i.field][0].value !== null) {
    //       this.activeFilters.push(i.field);
    //     }
    //   }
    // }
    setTimeout(() => {
      try {
        table.clearState();
      }catch (e) {
      }
    }, AppTableKeysData.TABLE_CHANGES_TIME_OUT);
  }

  /**
   * Calls when sort done
   */
  onSort(table) {
    setTimeout(() => {
      table.clearState();
    }, AppTableKeysData.TABLE_CHANGES_TIME_OUT);
  }

  /**
   * Clear single filter from advanced filters
   * @param val name
   */
  clearSingleFilter(table, val: any) {
    table.filter(null, val, 'contains');
  }

  /**
   * change status to full form
   * @param status status
   */
  getStatus(status: any) {
    switch (status) {
      case AppEnumConstants.STATUS_PENDING: {
        return AppEnumConstants.LABEL_PENDING;
      }
      case AppEnumConstants.STATUS_OPEN: {
        return AppEnumConstants.LABEL_OPEN;
      }
      case AppEnumConstants.STATUS_ACTIVE: {
        return AppEnumConstants.LABEL_ACTIVE;
      }
      case AppEnumConstants.STATUS_INACTIVE: {
        return AppEnumConstants.LABEL_INACTIVE;
      }
      case AppEnumConstants.STATUS_LETTER_INACTIVE: {
        return AppEnumConstants.LABEL_INACTIVE;
      }
      case AppEnumConstants.STATUS_VOID: {
        return AppEnumConstants.LABEL_VOID;
      }
      case AppEnumConstants.STATUS_REJECT: {
        return AppEnumConstants.LABEL_REJECT;
      }
      case AppEnumConstants.STATUS_REJECTED: {
        return AppEnumConstants.LABEL_REJECT;
      }
      case AppEnumConstants.STATUS_LOCK: {
        return AppEnumConstants.LABEL_LOCK;
      }
      case AppEnumConstants.STATUS_APPROVED: {
        return AppEnumConstants.LABEL_APPROVED;
      }
      case AppEnumConstants.STATUS_NOT_ASSIGNED: {
        return AppEnumConstants.LABEL_NOT_ASSIGNED;
      }
      case AppEnumConstants.STATUS_CLOSE: {
        return AppEnumConstants.LABEL_CLOSED;
      }
      case AppEnumConstants.STATUS_PAID: {
        return AppEnumConstants.LABEL_PAID;
      }
      case AppEnumConstants.STATUS_NOT_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_UNPAID;
      }
      case AppEnumConstants.STATUS_PARTIALLY_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PARTIALLY_PAID;
      }
      case AppEnumConstants.STATUS_MAILED: {
        return AppEnumConstants.LABEL_MAILED;
      }
      case AppEnumConstants.STATUS_LETTER_MAILED: {
        return AppEnumConstants.LABEL_MAILED;
      }
      case AppEnumConstants.EXPORT_STATUS_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_EXPORT;
      }
      case AppEnumConstants.EXPORT_STATUS_NOT_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_NOT_EXPORT;
      }
      case AppEnumConstants.STATUS_REQUESTED: {
        return AppEnumConstants.LABEL_REQUESTED;
      }
      case AppEnumConstants.STATUS_REQUIRED: {
        return AppEnumConstants.LABEL_REQUIRED;
      }
      case AppEnumConstants.STATUS_OPTIONAL: {
        return AppEnumConstants.LABEL_OPTIONAL;
      }
      case AppEnumConstants.STATUS_TAXABLE: {
        return AppEnumConstants.LABEL_TAXABLE;
      }
      case AppEnumConstants.STATUS_NOT_TAXABLE: {
        return AppEnumConstants.LABEL_NOT_TAXABLE;
      }
      case AppEnumConstants.STATUS_EMAIL_LABEL_NOT_SENT: {
        return AppEnumConstants.LABEL_EMAIL_NOT_SENT;
      }
      case AppEnumConstants.STATUS_EMAIL_LABEL_SENT: {
        return AppEnumConstants.LABEL_EMAIL_SENT;
      }
      case AppEnumConstants.STATUS_UNDER_DISCUSSION: {
        return AppEnumConstants.LABEL_UNDER_DISCUSSION;
      }
      case AppEnumConstants.PO_ACCOUNT_STATUS_YES: {
        return AppEnumConstants.PO_LABEL_PO_ACCOUNT_STATUS_YES;
      }
      case AppEnumConstants.PO_ACCOUNT_STATUS_NO: {
        return AppEnumConstants.PO_LABEL_PO_ACCOUNT_STATUS_NO;
      }
      case AppEnumConstants.BILL_SUBMITTED_STATUS_SUBMITTED: {
        return AppEnumConstants.BILL_SUBMITTED_LABEL_SUBMITTED;
      }
      case AppEnumConstants.BILL_PAYMENT_STATUS_PENDING: {
        return AppEnumConstants.BILL_PAYMENT_LABEL_PENDING;
      }
      case AppEnumConstants.BILL_PAYMENT_STATUS_COMPLETED: {
        return AppEnumConstants.BILL_PAYMENT_LABEL_COMPLETED;
      }
      case AppEnumConstants.STATUS_APPROVAL_PENDING: {
        return AppEnumConstants.LABEL_APPROVAL_PENDING;
      }

      case AppEnumConstants.STATUS_TRANSACTION_PENDING: {
        return AppEnumConstants.LABEL_TRANSACTION_PENDING;
      }

      case AppEnumConstants.STATUS_TRANSACTION_SUCCESS: {
        return AppEnumConstants.LABEL_TRANSACTION_SUCCESS;
      }

      case AppEnumConstants.STATUS_TRANSACTION_FAILED: {
        return AppEnumConstants.LABEL_TRANSACTION_FAILED;
      }

      case AppEnumConstants.STATUS_TRANSACTION_SUBMITTED: {
        return AppEnumConstants.LABEL_TRANSACTION_SUBMITTED;
      }

      case AppEnumConstants.STATUS_TRANSACTION_CANCELED: {
        return AppEnumConstants.LABEL_TRANSACTION_CANCELED;
      }

      case AppEnumConstants.STATUS_TRANSACTION_UNPROCESSED: {
        return AppEnumConstants.LABEL_UNPROCESSED;
      }

      case AppEnumConstants.STATUS_PROCESSED: {
        return AppEnumConstants.LABEL_PROCESSED;
      }

      case AppEnumConstants.STATUS_DELETED: {
        return AppEnumConstants.LABEL_DELETED;
      }
      case AppEnumConstants.STATUS_CANCELED: {
        return AppEnumConstants.LABEL_CANCELED;
      }
      case AppEnumConstants.STATUS_DRAFT: {
        return AppEnumConstants.LABEL_DRAFT;
      }

      case AppEnumConstants.STATUS_JIRA_CANCELED: {
        return AppEnumConstants.LABEL_TRANSACTION_CANCELED;
      }
      case AppEnumConstants.STATUS_JIRA_W_SUPPORT: {
        return AppEnumConstants.LABEL_JIRA_W_SUPPORT;
      }
      case AppEnumConstants.STATUS_JIRA_DONE: {
        return AppEnumConstants.LABEL_JIRA_DONE;
      }
      case AppEnumConstants.STATUS_JIRA_ESCALATED: {
        return AppEnumConstants.LABEL_JIRA_ESCALATED;
      }
      case AppEnumConstants.STATUS_JIRA_IN_PROGRESS: {
        return AppEnumConstants.LABEL_JIRA_IN_PROGRESS;
      }
      case AppEnumConstants.STATUS_JIRA_REOPENED: {
        return AppEnumConstants.LABEL_JIRA_REOPENED;
      }
      case AppEnumConstants.STATUS_JIRA_RESOLVED: {
        return AppEnumConstants.LABEL_JIRA_RESOLVED;
      }
      case AppEnumConstants.STATUS_JIRA_W_CUSTOMER: {
        return AppEnumConstants.LABEL_JIRA_W_CUSTOMER;
      }
      case AppEnumConstants.STATUS_TRANSACTION_IN_PROGRESS: {
        return AppEnumConstants.LABEL_JIRA_IN_PROGRESS;
      }
      case AppEnumConstants.STATUS_TRANSACTION_ON_HOLD: {
        return AppEnumConstants.LABEL_TRANSACTION_ON_HOLD;
      }
      case AppEnumConstants.STATUS_TRANSACTION_CREATED: {
        return AppEnumConstants.LABEL_TRANSACTION_CREATED;
      }
      case AppEnumConstants.STATUS_LETTER_CANCELED: {
        return AppEnumConstants.LABEL_CANCELED;
      }
    }
  }

  /**
   * single row or all selected
   * @param event list and boolean
   */
  rowSelected(table, event) {
    if (this.dataSource.length) {
      this.dataSource.forEach(val => {
        if (this.rows.some(x => x.id === val.id)) {
          val.selected = true;
        } else {
          val.selected = false;
        }
      });
    }
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common) {
    return function f(element) {
      return (((element.status === status || element.status === common)) && element.authCode);
    };
  }

  /**
   * Clear all filters
   */
  clearAllFilters(table) {
    this.activeFilters = [];
    table.clear();
  }

  numberOnly(event): boolean {
    return ((!isNaN(+event.key) || event.key === 'Backspace' || event.key === 'Delete' || event.key === '-'));
  }

  /**
   * this method can be used to get range values
   * @param table to table ref
   * @param value1 to value
   * @param value2 to value
   * @param field to field
   * @param event keyboard event
   */
  filterRange(table, value1, value2, field, event) {
    if (!this.numberOnly(event)) {
      return;
    }
    const arr: any[] = [];
    arr[0] = value1;
    arr[1] = value2;

    if (arr[0] === '' && arr[1] === '') {
      table.filter(null, field, 'contains');

    } else {
      table.filter(arr, field, 'contains');

    }
  }

  /**
   * Assign the specific row action list to context menu action on mouse enter
   * @param actionButtonList single row action list
   */
  setContextMenuActionBtnList(actionButtonList: any[]) {
      this.contextMenuActionList = actionButtonList;
  }

  /**
   * Table action right click hide to tray menu
   * @param  event
   */
  hideActionMenu(event){
    if (event?.visible){
      event.hide();
    }
  }

  scrollHideActionMenu(event) {
    event.hide();
  }

  hide(event) {
    console.log(event);
    if (event === AppEnumConstants.STATUS_APPROVED  && AppEnumConstants.STATUS_ACTIVE) {
      this.hideMenu = true;
    }else {
      this.hideMenu = false;
    }
  }
}

