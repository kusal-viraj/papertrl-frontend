import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";

@Component({
  selector: 'app-attached-credit-note-detail',
  templateUrl: './attached-credit-note-detail.component.html',
  styleUrls: ['./attached-credit-note-detail.component.scss']
})
export class AttachedCreditNoteDetailComponent implements OnInit {

  @Input() activeAction: any
  @Output() removesAndBillListLengthZero = new EventEmitter();

  public attachedCreditNoteDetailForm: UntypedFormGroup;

  constructor(public formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.initFormGroup();
  }

  /**
   * view attached bill modal related function*------------------------------------------>
   */

  /**
   * this method can be used to initialize form builder
   */
  initFormGroup() {
    this.attachedCreditNoteDetailForm = this.formBuilder.group({
      id: [null],
      netAmount: [null],
      vendorName: [null],
      poNumber: [null],
      creditNoteDetails: this.formBuilder.array([]),
    });
    this.patchValue();
  }

  /**
   * this method return credit note form controllers
   */
  get f() {
    return this.attachedCreditNoteDetailForm.controls;
  }


  /**
   * this method can be used to patch value to form
   */
  patchValue() {
    if (!this.activeAction) {
      return;
    } else {
      this.attachedCreditNoteDetailForm.get('netAmount').patchValue(this.activeAction['netAmount']);
      this.attachedCreditNoteDetailForm.get('vendorName').patchValue(this.activeAction['vendorName']);
      this.attachedCreditNoteDetailForm.get('poNumber').patchValue(this.activeAction['poNumber']);

      this.activeAction.creditNoteDetails.forEach(val=>{
        this.addItem();
      });
      this.lineItemMainTable.patchValue(this.activeAction.creditNoteDetails);
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.attachedCreditNoteDetailForm.get('creditNoteDetails') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      creditNoteNo: [null],
      creditBalance: [null],
      creditTotal: [null],
      appliedCreditAmount: [null],
    });
    this.lineItemMainTable.push(itemInfo);
  }
}
