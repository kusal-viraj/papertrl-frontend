import {AdditionalFieldDetailDto} from "../dto/additional-field/additional-field-detail-dto";
import {AppTableKeysData} from "../enums/app-table-keys-data";
import {TableDataOptionsDto} from "../dto/table/table-data-options-dto";
import {AppFormConstants} from "../enums/app-form-constants";
import {FormArray} from "@angular/forms";
import {GridService} from "../services/common/table/grid.service";
import {AppConstant} from "./app-constant";

interface CustomGrid {
  headers: any;
  tableWidth: number;
}


export class CustomLineItemGrid {
  public expenseTableHeaders: CustomGrid = {headers: [], tableWidth: 1500};
  public itemTableHeaders: CustomGrid = {headers: [], tableWidth: 1500};
  private billExpenseTable = [];
  private billItemTable = [];
  public appConstant: AppConstant = new AppConstant();

  constructor(private gridService: GridService) {
  }


  initCreateBillExpTable(additionalFields: AdditionalFieldDetailDto[]) {
    this.resetTable(AppTableKeysData.BILL_EXP_TABLE);
    let stateExist = false;
    this.getTableStateFromBackend(this.expenseTableHeaders,
      AppTableKeysData.BILL_EXP_TABLE, this.appConstant.GRID_BILL_EXPENSE_COST_LINE_ITEM_LIST, additionalFields).then((r: boolean) => {
      stateExist = r;
      this.billExpenseTableInit();
      const headers = this.setAdditionalFields(additionalFields, this.billExpenseTable);
      if (!stateExist) {
        this.createTableDataStructure(headers, AppTableKeysData.BILL_EXP_TABLE);
      }
      this.expenseTableHeaders.headers = headers;
      setTimeout(() => {
        // sessionStorage.removeItem(AppTableKeysData.BILL_EXP_TABLE);
      }, 500);
    });
  }

  initCreateBillItmTable(additionalFields: AdditionalFieldDetailDto[]) {
    this.resetTable(AppTableKeysData.BILL_ITM_TABLE);
    let stateExist = false;
    this.getTableStateFromBackend(this.itemTableHeaders,
      AppTableKeysData.BILL_ITM_TABLE, this.appConstant.GRID_BILL_ITEM_COST_LINE_ITEM_LIST, additionalFields).then((r: boolean) => {
      stateExist = r;
      this.billItemTableInit();
      const headers = this.setAdditionalFields(additionalFields, this.billItemTable);
      if (!stateExist) {
        this.createTableDataStructure(headers, AppTableKeysData.BILL_ITM_TABLE);
      }
      this.itemTableHeaders.headers = headers;
      setTimeout(() => {
        // sessionStorage.removeItem(AppTableKeysData.BILL_ITM_TABLE);
      }, 500);
    });
  }

  initCreateRecurringBillExpTable(additionalFields?: AdditionalFieldDetailDto[]) {
    this.resetTable(AppTableKeysData.BILL_EXP_TABLE);
    let stateExist = false;
    this.getTableStateFromBackend(this.expenseTableHeaders,
      AppTableKeysData.BILL_EXP_TABLE, this.appConstant.GRID_RECURRING_BILL_EXPENSE_COST_LINE_ITEM_LIST, additionalFields).then((r: boolean) => {
      stateExist = r;
      this.recurringBillExpenseTableInit();
      const headers = this.setAdditionalFields(additionalFields, this.billExpenseTable);
      if (!stateExist) {
        this.createTableDataStructure(headers, AppTableKeysData.BILL_EXP_TABLE);
      }
      this.expenseTableHeaders.headers = headers;
      setTimeout(() => {
        // sessionStorage.removeItem(AppTableKeysData.BILL_EXP_TABLE);
      }, 500);
    });
  }

  initCreateRecurringBillItmTable(additionalFields?: AdditionalFieldDetailDto[]) {
    this.resetTable(AppTableKeysData.BILL_ITM_TABLE);
    let stateExist = false;
    this.getTableStateFromBackend(this.itemTableHeaders,
      AppTableKeysData.BILL_ITM_TABLE, this.appConstant.GRID_RECURRING_BILL_ITEM_COST_LINE_ITEM_LIST, additionalFields).then((r: boolean) => {
      stateExist = r;
      this.recurringBillItemTableInit();
      const headers = this.setAdditionalFields(additionalFields, this.billItemTable);
      if (!stateExist) {
        this.createTableDataStructure(headers, AppTableKeysData.BILL_ITM_TABLE);
      }
      this.itemTableHeaders.headers = headers;
      setTimeout(() => {
        // sessionStorage.removeItem(AppTableKeysData.BILL_ITM_TABLE);
      }, 500);
    });
  }

  getTableStateFromBackend(tableObj, tableKey, gridName, additionalFields) {
    return new Promise(resolve => {
      this.gridService.getLineItemTableState(gridName).subscribe((res: any) => {
        if (res.body.columnWidths) {
          const modifiedState = this.setAdditionalFieldsForExistingData(res.body, additionalFields);
          sessionStorage.setItem(tableKey, JSON.stringify(modifiedState));
          const data: any = res.body;
          const columnWidthsArray = data.columnWidths.split(',');
          tableObj.tableWidth = columnWidthsArray.reduce((a, b) => {
            return parseInt(a) + parseInt(b);
          }, 0);
          resolve(true);
        }
        resolve(false);
      }, error => {
        resolve(false);
      });
    });
  }

  createTableDataStructure(headers: any[], key) {
    const tableDataOptions: TableDataOptionsDto = new TableDataOptionsDto();
    const fieldsToOrderInLast = [AppFormConstants.AMOUNT, AppFormConstants.TABLE_ACTION];
    fieldsToOrderInLast.forEach(action => {
      this.reorderArray(headers, action);
    });
    tableDataOptions.columnOrder = [];
    tableDataOptions.columnWidths = [];
    headers.forEach(val => {
      tableDataOptions.columnOrder.push(val.field);
      tableDataOptions.columnWidths.push(val.width);
    });
    tableDataOptions.tableWidth = tableDataOptions.columnWidths.reduce((a, b) => {
      return parseInt(a) + parseInt(b);
    }, 0);
    tableDataOptions.columnWidths = tableDataOptions.columnWidths.join(',');
    sessionStorage.setItem(key, JSON.stringify(tableDataOptions));
  }

  reorderArray(headers, action) {
    const index = headers.findIndex(item => item.field === action);
    if (index !== -1) {
      const targetItem = headers.splice(index, 1)[0]; // Remove the item from its current position
      headers.push(targetItem); // Push it to the last position
    }
  }

  resetTable(key) {
    if (key === AppTableKeysData.BILL_ITM_TABLE){
      this.itemTableHeaders = {headers: [], tableWidth: 600};
    }
    if (key === AppTableKeysData.BILL_EXP_TABLE){
      this.expenseTableHeaders = {headers: [], tableWidth: 600};
    }
    sessionStorage.removeItem(key);
  }

  private setAdditionalFields(additionalFields, arr) {
    additionalFields?.forEach((value: any) => {
      const header = {
        label: `${value.fieldName}${value.required ? '*' : ''}`,    // fieldName should be set to label
        width: 250,    // width should be 250
        field: value.id,    // id should be set to field
        addiField: value.id,    // is Additional field
        class: '',   // You did not specify the class, so it's set as empty
        resizable: false,
        reorderable: false,
        frozen: false
      };
      arr.push(header);
    });
    return arr;
  }

  private setAdditionalFieldsForExistingData(existingState, additionalFields) {
    additionalFields.forEach(field => {
      // Find the index to insert the new field
      const insertIndex = existingState.columnOrder.indexOf(AppFormConstants.AMOUNT);

      // Modify columnOrder by adding the new field's id
      existingState.columnOrder.splice(insertIndex, 0, field.id);

      // Modify columnWidths by adding the new field's width
      const columnWidthsArray = existingState.columnWidths.split(',');
      columnWidthsArray.splice(insertIndex, 0, '250');
      existingState.columnWidths = columnWidthsArray.join(',');

      // You might also want to create and add new field objects
      // with additional attributes as per your specifications.
    });

    // Now, existingState.columnOrder and existingState.columnWidths are updated.
    // You might return existingState or use it as needed.
    return existingState;
  }


  changedTableState(tableKey: any, gridName: string) {
    setTimeout(() => {
      const tableData = JSON.parse(sessionStorage.getItem(tableKey));
      tableData.gridName = gridName;
      this.gridService.updateLineItemTableState(tableData).subscribe((res: any) => {
        setTimeout(() => {
          sessionStorage.removeItem(tableKey);
        }, 1000);
      });
    }, 500);
  }

  resetTableUserWiseData(gridName, additionalFields) {
    this.gridService.resetLineItemTableState(gridName).subscribe((res: any) => {
      if (gridName === this.appConstant.GRID_BILL_EXPENSE_COST_LINE_ITEM_LIST) {
        this.initCreateBillExpTable(additionalFields);
      }
      if (gridName === this.appConstant.GRID_BILL_ITEM_COST_LINE_ITEM_LIST) {
        this.initCreateBillItmTable(additionalFields);
      }
      if (gridName === this.appConstant.GRID_RECURRING_BILL_EXPENSE_COST_LINE_ITEM_LIST) {
        this.initCreateRecurringBillExpTable(additionalFields);
      }
      if (gridName === this.appConstant.GRID_RECURRING_BILL_ITEM_COST_LINE_ITEM_LIST) {
        this.initCreateRecurringBillItmTable(additionalFields);
      }
    });
  }

  private billExpenseTableInit() {
    this.billExpenseTable = [
      {
        label: '#',
        width: 50,
        field: AppFormConstants.HASH_NUMBER,
        class: '',
        resizable: false,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Project/Task',
        width: 250,
        field: AppFormConstants.PROJECT_CODE,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Number*',
        width: 250,
        field: AppFormConstants.ACCOUNT_NUMBER,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Name',
        width: 250,
        field: AppFormConstants.ACCOUNT_NAME,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Description',
        width: 250,
        field: AppFormConstants.DESCRIPTION,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Department',
        width: 250,
        field: AppFormConstants.DEPARTMENT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'PO Receipt',
        width: 250,
        field: AppFormConstants.BILL_LINE_PO_RECEIPT,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Billable', width: 100, field: AppFormConstants.BILLABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Taxable', width: 100, field: AppFormConstants.TAXABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Line Amount',
        width: 250,
        field: AppFormConstants.AMOUNT,
        class: 'freeze-50 detail-table-header-right',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
      {
        label: '',
        width: 50,
        field: AppFormConstants.TABLE_ACTION,
        class: 'freeze-0',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
    ];
  }

  private billItemTableInit() {
    this.billItemTable = [
      {
        label: '#',
        width: 50,
        field: AppFormConstants.HASH_NUMBER,
        class: '',
        resizable: false,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Item Number',
        width: 250,
        field: AppFormConstants.ITEM_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Item Name*',
        width: 250,
        field: AppFormConstants.ITEM_NAME,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Vendor Part Number',
        width: 250,
        field: AppFormConstants.VENDOR_ITEM_NUMBER,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Description',
        width: 250,
        field: AppFormConstants.DESCRIPTION,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Project/Task',
        width: 250,
        field: AppFormConstants.PROJECT_CODE,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Number',
        width: 250,
        field: AppFormConstants.ACCOUNT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Department',
        width: 250,
        field: AppFormConstants.DEPARTMENT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'PO Receipt',
        width: 250,
        field: AppFormConstants.PO_RECEIPT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Billable', width: 100, field: AppFormConstants.BILLABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Taxable', width: 100, field: AppFormConstants.TAXABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Quantity*', width: 100, field: AppFormConstants.QTY, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Cost*', width: 250, field: AppFormConstants.RATE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Line Amount',
        width: 250,
        field: AppFormConstants.AMOUNT,
        class: 'freeze-50 detail-table-header-right',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
      {
        label: '',
        width: 50,
        field: AppFormConstants.TABLE_ACTION,
        class: 'freeze-0',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
    ];
  }

  private recurringBillExpenseTableInit() {
    this.billExpenseTable = [
      {
        label: '#',
        width: 50,
        field: AppFormConstants.HASH_NUMBER,
        class: '',
        resizable: false,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Project/Task',
        width: 250,
        field: AppFormConstants.PROJECT_CODE,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Number*',
        width: 250,
        field: AppFormConstants.ACCOUNT_NUMBER,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Name',
        width: 250,
        field: AppFormConstants.ACCOUNT_NAME,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Description',
        width: 250,
        field: AppFormConstants.DESCRIPTION,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Department',
        width: 250,
        field: AppFormConstants.DEPARTMENT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Billable', width: 100, field: AppFormConstants.BILLABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Taxable', width: 100, field: AppFormConstants.TAXABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Line Amount',
        width: 250,
        field: AppFormConstants.AMOUNT,
        class: 'freeze-50 detail-table-header-right',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
      {
        label: '',
        width: 50,
        field: AppFormConstants.TABLE_ACTION,
        class: 'freeze-0',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
    ];
  }

  private recurringBillItemTableInit() {
    this.billItemTable = [
      {
        label: '#',
        width: 50,
        field: AppFormConstants.HASH_NUMBER,
        class: '',
        resizable: false,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Item Number',
        width: 250,
        field: AppFormConstants.ITEM_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Item Name*',
        width: 250,
        field: AppFormConstants.ITEM_NAME,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Vendor Part Number',
        width: 250,
        field: AppFormConstants.VENDOR_ITEM_NUMBER,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Description',
        width: 250,
        field: AppFormConstants.DESCRIPTION,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Project/Task',
        width: 250,
        field: AppFormConstants.PROJECT_CODE,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Account Number',
        width: 250,
        field: AppFormConstants.ACCOUNT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Department',
        width: 250,
        field: AppFormConstants.DEPARTMENT_ID,
        class: '',
        resizable: true,
        reorderable: true,
        frozen: false
      },
      {
        label: 'Billable', width: 100, field: AppFormConstants.BILLABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Taxable', width: 100, field: AppFormConstants.TAXABLE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Quantity*', width: 100, field: AppFormConstants.QTY, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Cost*', width: 250, field: AppFormConstants.RATE, class: '', resizable: true, reorderable: true,
        frozen: false
      },
      {
        label: 'Line Amount',
        width: 250,
        field: AppFormConstants.AMOUNT,
        class: 'freeze-50 detail-table-header-right',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
      {
        label: '',
        width: 50,
        field: AppFormConstants.TABLE_ACTION,
        class: 'freeze-0',
        resizable: false,
        reorderable: false,
        frozen: true,
      },
    ];
  }

  getField(col, formArray: FormArray<any>) {
    return formArray.value.find(x => x.fieldId == col.field);
  }

  getFieldIndex(col, formArray: FormArray<any>) {
    return formArray.value.findIndex(x => x.fieldId == col.field);
  }
}

