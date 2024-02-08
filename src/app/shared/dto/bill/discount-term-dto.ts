export class DiscountTermDto {
  id: number;
  term: string;
  netDaysDue: number;
  discountPercentage: number;
  discountDaysDue: number;
  dateCreated: Date;
  createdUser: string;
  lastUpdatedOn: Date;
  lastUpdateBy: string;

  constructor() {
  }
}
