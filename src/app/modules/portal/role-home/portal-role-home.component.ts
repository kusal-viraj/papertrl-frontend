import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-portal-role-home',
  templateUrl: './portal-role-home.component.html',
  styleUrls: ['./portal-role-home.component.scss']
})
export class PortalRoleHomeComponent implements OnInit {
  isListRole = true;
  isCreateRole = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleRoles(val: string) {
    if (val === 'rc') {
      this.isCreateRole = true;
      this.isListRole = false;
    } else if (val === 'rl') {
      this.isCreateRole = false;
      this.isListRole = true;
    }
  }
}
