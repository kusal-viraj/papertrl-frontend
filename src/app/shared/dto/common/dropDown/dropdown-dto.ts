export class DropdownDto {
  data: any = new Array();
  name: string;
  id: string;
  messageAndUnsupportedEventList?: any;

  addNew() {
      this.data.splice(0, 0, {id: 0, name: 'Add New'});
  }

  addAll() {
    this.data.splice(0, 0, {id: 0, name: 'All'});
  }

  addNewAsDisabled() {
    this.data.splice(0, 0, {id: 0, name: 'Add New', disabled: false});
  }

  addNewWithAddAll() {
    this.data.splice(0, 0, {id: -1, name: 'Add New'});
  }
}
