import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-integration-home',
  templateUrl: './integration-home.component.html',
  styleUrls: ['./integration-home.component.scss']
})
export class IntegrationHomeComponent implements OnInit {
  public tabIndex = 0;
  public createSystem = false;
  public createConfig = false;



  constructor(public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.tabIndex = 0;
    this.route.params.subscribe(params => {
      if (params.tab !== undefined) {
        this.tabChanged(params.tab);
      }
    });
  }

  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
  }

  toggle(val) {
    if (val === 'sys') {
      this.createSystem = true;
      this.createConfig = false;

    } else if (val === 'cus') {
      this.createSystem = false;
      this.createConfig = true;
    }
  }


}
