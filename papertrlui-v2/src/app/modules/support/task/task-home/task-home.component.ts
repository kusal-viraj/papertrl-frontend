import {Component, Input, OnDestroy, OnInit} from '@angular/core';

export class TaskState {
  isViewCreateTask?: any;
  isViewListTask?: any;
}


@Component({
  selector: 'app-task-home',
  templateUrl: './task-home.component.html',
  styleUrls: ['./task-home.component.scss']
})
export class TaskHomeComponent implements OnInit, OnDestroy {
  public taskState = new TaskState();

  isViewCreateTask = false;
  isViewListTask = false;
  public isRefreshTable: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.isViewListTask = true;
    if (sessionStorage.getItem('task-state')) {
      this.taskState = JSON.parse(sessionStorage.getItem('task-state'));
      this.isViewListTask = this.taskState.isViewListTask;
      this.isViewCreateTask = this.taskState.isViewCreateTask;
    }
  }


  /**
   * Destroys the ItemState on Session Storage
   */
  ngOnDestroy() {
    sessionStorage.removeItem('task-state');
  }

  /**
   * Store Actions on Session Storage
   */
  storeSessionStore() {
    this.taskState.isViewCreateTask = this.isViewCreateTask;
    this.taskState.isViewListTask = this.isViewListTask;
    sessionStorage.setItem('task-state', JSON.stringify(this.taskState));
  }

  /**
   * this method can be used to view content according to hte change
   * @param clickString to string value
   */
  toggleCreateTask(clickString) {

    if (clickString === 'create-task') {
      this.isViewCreateTask = true;
      this.isViewListTask = false;
    } else {
      this.isViewListTask = true;
      this.isViewCreateTask = false;
    }
    this.storeSessionStore();
  }

  /**
   * this methos can be used to refresh the table
   * @param event to value
   */
  refreshTable(event) {
    if (event !== null && event !== undefined && event === 'TASK_TABLE_UPDATED'){
      this.isRefreshTable = true;
      this.isViewListTask = true;
      this.isViewCreateTask = false;
    } else {
      return false;
    }
  }
}
