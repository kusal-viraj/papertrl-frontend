export class InvoiceDiamentionDto {
  constructor(public fieldName: string, public pageNo: number, public axisX: number, public axisY: number,
              public width: number, public height: number) {
  }
}
