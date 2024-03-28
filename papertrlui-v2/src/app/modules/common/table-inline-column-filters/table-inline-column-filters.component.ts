import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {Subscription} from 'rxjs';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {MultiSelect} from "primeng/multiselect";

@Component({
  selector: '[app-table-inline-column-filters]',
  templateUrl: './table-inline-column-filters.component.html',
  styleUrls: ['./table-inline-column-filters.component.scss']
})
export class TableInlineColumnFiltersComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() col: any;
  @Input() columns: any;
  @Input() dt: any;
  @Input() tableSupportBase: TableSupportBase;
  @ViewChild('tr') tr: ElementRef;
  subscription: Subscription;
  public width;

  public enums = AppEnumConstants;

  constructor(public gridService: GridService) {
  }

  ngOnInit(): void {
    this.subscription = this.gridService.updateDropDownSubject.subscribe((val) => {
      if (val) {
        this.updateDropdownData();
      }
    });
    this.getDropdownData();
  }

  /**
   * Get Dropdown values to grid dropdowns from the url which comes from
   * table column structure.
   * Assigning the dropdown values to the columns array related to specific column
   */
  getDropdownData() {
    if ((this.col.searchType === 'multiSelect' || this.col.searchType === 'dropdown') && this.col.dropDownUrl) {
      this.gridService.getDropdownList(this.col.dropDownUrl).subscribe(res => {
        this.col.dropdownValues = res.body;
      });
    }
  }

  /**
   * Update Dropdown values for grid dropdowns when it needs
   * table column structure.
   * Assigning the dropdown values to the columns array related to specific column
   */
  updateDropdownData() {
    for (const item of this.columns) {
      if ((item.searchType === 'multiSelect' || item.searchType === 'dropdown') && item.dropDownUrl) {
        this.gridService.getDropdownList(item.dropDownUrl).subscribe(res => {
          item.dropdownValues = res.body;
        });
      }
    }
  }

  /**
   * Convert the date filter range to string and push to filters array
   * @param value Values array where 2 date ranges assigned to index 0 and 1
   * @param filter field name to be filtered
   * @param isClear is called to clear or filter
   */
  filterTableDate(value, filter, isClear) {
    const dateStr = [];
    if (isClear) {
      filter([]);
      return;
    }
    dateStr[0] = value[0];
    dateStr[2] = value[0].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    if (value[1] != null) {
      dateStr[1] = value[1];
      dateStr[3] = value[1].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } else {
      dateStr[1] = null;
      dateStr[3] = null;
    }
    filter(dateStr);
  }


  /**
   * Destroy the subscription
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Set the width of the current initial width to the max width of
   * the search fields
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        if (this.tr.nativeElement.offsetWidth < 10 ){
          this.width = this.col.columnWidth;
        } else {
          this.width = this.tr.nativeElement.offsetWidth;
        }
      } catch (e) {
        this.width = this.col.columnWidth;
      }
    }, 100);

  }

}
