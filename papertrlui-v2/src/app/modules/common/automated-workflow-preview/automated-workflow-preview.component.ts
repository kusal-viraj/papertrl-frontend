import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-automated-workflow-preview',
  templateUrl: './automated-workflow-preview.component.html',
  styleUrls: ['./automated-workflow-preview.component.scss']
})
export class AutomatedWorkflowPreviewComponent implements OnInit {
  @Input() matchingAutomation: any [] = [];
  @Input() fromProcessBill = false;

  constructor() { }

  ngOnInit(): void {
  }

}
