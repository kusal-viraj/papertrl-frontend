export class CompareDate {
  constructor() {
  }

  public static compare(date1, date2): boolean {

    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (d1.toDateString() === d2.toDateString()) {
      return true;
    } else if (d1 > d2) {
      return false;
    } else if (d1 < d2) {
      return true;
    }
  }
}
