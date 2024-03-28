export class PaymentType {
  id: any;
  name: any;
  description: any;
  createdBy: string;
  createdOn: any;
  status: string;
  optionId: string;

  constructor(formValue: any) {
    this.name = formValue.name;
    this.description = formValue.description;
    this.optionId = formValue.optionId;

  }
}
