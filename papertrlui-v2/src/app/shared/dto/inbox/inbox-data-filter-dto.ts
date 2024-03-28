export class InboxDataFilterDto {
  public first: number;
  public rows: number;
  public sortValue: string;
  public searchValue: string;
  public status: string;
  public sortOrder: number;

  public clearSorting() {
    this.sortValue = null;
    this.sortOrder = 0; // Or any other default value
  }

}
