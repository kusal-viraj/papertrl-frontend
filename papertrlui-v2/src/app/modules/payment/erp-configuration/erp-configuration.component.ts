import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';

@Component({
  selector: 'app-erp-configuration',
  templateUrl: './erp-configuration.component.html',
  styleUrls: ['./erp-configuration.component.scss']
})
export class ErpConfigurationComponent implements OnInit {
  @Input() public erpConfigRequestPanel: boolean;
  @Input() public selectedERPConfig: { label: any; id: any };
  @Output() public closePanelEmit = new EventEmitter();

  public qobForm: UntypedFormGroup;

  monthOptions: { id: number, name: string }[] = [
    {id: 1, name: 'Current Month'},
    {id: 3, name: '3 Months'},
    {id: 6, name: '6 Months'},
    {id: 12, name: '12 Months'},
  ];

  constructor(private formBuilder: UntypedFormBuilder) {

  }

  ngOnInit(): void {
    this.qobForm = this.formBuilder.group({
      selectedMonth: [AppConstant.NULL_VALUE, Validators.required],
      companyName: [AppConstant.NULL_VALUE, Validators.required],
    });
  }


  sendRequest() {
    if (!this.qobForm.get('selectedMonth').value || !this.qobForm.get('companyName').value) {
      this.qobForm.get('selectedMonth').markAsDirty();
      this.qobForm.get('companyName').markAsDirty();
    } else {
     this.erpConfigRequestPanel = false;
     this.qobForm.reset();
    }
  }

  resetData() {
    this.qobForm.reset();
  }

  closePanel() {
    this.closePanelEmit.emit(true);
  }
}
