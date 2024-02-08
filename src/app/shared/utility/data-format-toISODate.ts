export class DataFormatToISODate {
  /**
   * This method use for convert long date to ToISOString
   * @param longDate number
   */
  public static convert(longDate: any) {
    const date = new Date(longDate).toISOString();
    return new Date(date);
  }

}
