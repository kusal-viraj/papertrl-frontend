import {Component, OnInit} from '@angular/core';
import {RoleService} from '../../../shared/services/roles/role.service';
import {TreeNode} from 'primeng/api';

@Component({
  selector: 'app-view-all-roles',
  templateUrl: './view-all-roles.component.html',
  styleUrls: ['./view-all-roles.component.scss']
})
export class ViewAllRolesComponent implements OnInit {
 public allRoles: any [] = [];
 public files: TreeNode[];

  constructor(public roleService: RoleService) {
  }

  ngOnInit(): void {
    this.roleService.getInitialSystemRoles().subscribe((res: any) => {
        this.files = res.body.data;
        this.roleService.getRoles().subscribe((res1: any) => {
          this.allRoles = res1.body.roles;
        });
      }
    );
  }
}
