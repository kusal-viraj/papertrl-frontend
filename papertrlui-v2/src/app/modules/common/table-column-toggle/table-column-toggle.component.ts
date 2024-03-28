import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Table} from 'primeng/table';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {FilterMetadata} from 'primeng/api/filtermetadata';

@Component({
  selector: 'app-table-column-toggle',
  templateUrl: './table-column-toggle.component.html',
  styleUrls: ['./table-column-toggle.component.scss']
})
export class TableColumnToggleComponent implements OnInit, AfterContentChecked {

  @Input() cols; // column list
  @Input() hiddenOptions; // Option in array which are hidden in load
  @Input() tableKey; // table key
  @Input() gridName; // grid Name
  @Input() tableInstance: Table;
  @Output() selectionsUpdated = new EventEmitter();
  @Output() updateColOrder = new EventEmitter();
  @Output() restoreTable = new EventEmitter();

  public filteredMap = new Map<string, FilterMetadata>();

  constructor(public gridService: GridService) {
  }

  ngOnInit(): void {
  }

  /**
   * Triggers when column show hide is changed
   */
  selectionChanged() {
    this.selectionsUpdated.emit(this.cols);
  }

  /**
   * Save the state of the table and send to backend
   * Add the hidden columns to the array in order
   */
  reorderCols() {
    this.tableInstance.saveState();
    const tableObj = JSON.parse(sessionStorage.getItem(this.tableKey));
    sessionStorage.setItem(this.tableKey, JSON.stringify(tableObj));
    setTimeout(() => {
      // this.tableInstance.restoreColumnOrder();
      this.updateColOrder.emit(true);
    }, 100);
  }

  /**
   * Triggers when apply button is clicked and then save
   */
  applyState() {
    this.selectionChanged();
    setTimeout(() => {
      this.reorderCols();
    }, 100)
    // this.resetFilters();
  }

  resetState() {
    this.gridService.resetTableStructure(this.gridName).subscribe((res: any) => {
      // this.resetFilters();
      this.restoreTable.emit();
    });
  }


  /**
   * Mark a tick in shown fields by comparing with the column list
   */
  markTick() {
    this.hiddenOptions.forEach(val => {
      val.ticked = this.cols.some(x => x.id === val.id);
    });
  }

  /**
   * Change the ticked values after the content is initiated
   */
  ngAfterContentChecked(): void {
    this.markTick();
  }


  resetFilters(){
    this.tableInstance.filters = Object.fromEntries(this.filteredMap);
    this.tableInstance?.reset();
    this.tableInstance?.columns.forEach((val) => {
      val.value = null;
      val.value2 = null;
    });
  }

}
