import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {Table} from 'primeng/table';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-table-column-filters',
  templateUrl: './table-column-filters.component.html',
  styleUrls: ['./table-column-filters.component.scss']
})
export class TableColumnFiltersComponent implements OnInit, OnDestroy {

  @Input() columns: any; // Table columns array
  @Input() tableSupportBase: TableSupportBase; // Instance of the table Support base;
  @Input() dt: Table; // Reference of the table
  @Output() closeDrawer = new EventEmitter();

  public enums = AppEnumConstants;
  subscription: Subscription;
  filters = [];
  btnLoading = false;

  filteredMap = new Map<string, FilterMetadata>();

  constructor(public gridService: GridService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.subscription = this.gridService.dropDownSubject.subscribe(() => {
      this.getDropdownData();
    });
  }

  /**
   * Get Dropdown values to grid dropdowns from the url which comes from
   * table column structure.
   * Assigning the dropdown values to the columns array related to specific column
   */
  getDropdownData() {
    for (const item of this.columns) {
      if ((item.searchType == 'multiSelect' || item.searchType == 'dropdown') && item.dropDownUrl) {
        this.gridService.getDropdownList(item.dropDownUrl).subscribe(res => {
          item.dropdownValues = res.body;
        });
      }
    }
  }

  /**
   * Convert the date filter range to string and push to filters array
   * @param value Values array where 2 date ranges assigned to index 0 and 1
   * @param field field name to be filtered
   * @param isClear is called to clear or filter
   */
  filterTableDate(value, field, isClear) {
    const dateStr = [];
    if (isClear) {
      this.addToFilter(null, field, 'contains');
      return;
    }
    dateStr[0] = value[0].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    if (value[1] != null) {
      dateStr[1] = value[1].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } else {
      dateStr[1] = null;
    }
    this.addToFilter(dateStr, field, 'contains');
  }

  /**
   * Convert to 2 numbers on both fields into an array to index 0 and 1
   * Check the input click is equal to number or backspace or delete
   * @param value1 Fecond value of the range
   * @param value2 Second value of the range
   * @param field Field name to be filtered
   * @param event User input
   */
  filterTableRange(value1, value2, field, event) {
    if (!this.tableSupportBase.numberOnly(event)) {
      return;
    }
    const arr: any[] = [];
    arr[0] = value1;
    arr[1] = value2;

    if (arr[0] === '' && arr[1] === '') {
      this.addToFilter(null, field, 'contains');
    } else {
      this.addToFilter(arr, field, 'contains');
    }
  }

  /**
   * Add all the value to filters array in every change, keyup
   * @param val Value to be filtered
   * @param field Field name to be filtered
   * @param type type of the search Eg: 'contains', 'endsWith'
   */
  addToFilter(val, field, type) {
    const obj: FilterMetadata = {value: val, operator: field, matchMode: type};
    this.filters.push(obj);
  }

  /**
   * Add the latest field values from the filters array to a map to have one record for one field
   * Apply the filtered object for table and trigger reset() method to filter the values
   */
  applyFilter() {
    for (const item of this.filters) {
      const obj = {matchMode: item.matchMode, value: item.value};
      this.filteredMap.set(item.operator, obj);
    }
    this.dt.filters = Object.fromEntries(this.filteredMap);
    this.dt._filter();
  }

  /**
   * Clear the Filters of the table, filters array, Map.
   * CLear the input fields values
   * Filter the table again with empty values
   */
  resetFilters() {
    this.filteredMap.clear();
    this.filters = [];
    this.dt.filters = Object.fromEntries(this.filteredMap);
    this.dt.reset();
    this.columns.forEach((val) => {
      val.value = null;
      val.value2 = null;
    });
    this.closeDrawer.emit(true);
  }

  /**
   * Destroy the subscription
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
