import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit{

  @Input() showLoader = true;
  @Input() showIcon = false;
  @Input() showHeaderMessage = true;
  @Input() showContentMessage = true;
  @Input() messageContent = `Thanks for your patience, this shouldn't take long.`;
  @Input() headerMessage = 'Loading Content...';
  @Input() styleClass;
  @Input() icon = 'fa-solid fa-magnifying-glass';

  ngOnInit(): void {
    if (!this.messageContent){
      this.messageContent = `Thanks for your patience, this shouldn't take long.`;
    }
    if (!this.headerMessage){
      this.headerMessage = `Loading Content...`;
    }
  }
}
