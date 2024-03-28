import {UserCreateComponent} from "../user-create/user-create.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {NgxDropzoneModule} from "ngx-dropzone";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {BillSocketService} from "../../../shared/services/bills/bill-socket.service";
import {RoleCreateComponent} from "./role-create.component";
import {RoleService} from "../../../shared/services/roles/role.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('RoleCreateComponent', () => {
  let component: RoleCreateComponent;
  let fixture: ComponentFixture<RoleCreateComponent>;
  let roleService: RoleService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const roleServiceSpy = jasmine.createSpyObj('RoleService', ['checkRoleNameAvailability']);

    await TestBed.configureTestingModule({
      declarations: [UserCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule, BrowserAnimationsModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: RoleService, useValue: roleServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(RoleCreateComponent);
      roleService = TestBed.inject(RoleService);
      component = fixture.componentInstance;
      component.initFormBuilder();
    });
  });

  it('01. Role Name Validation with empty value', () => {
    let errors: any = {};
    const roleName = component.createRoleForm.get('roleName');
    errors = roleName.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('02. Role Name Validation with  value', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('sss');
    expect(roleName.valid).toBeTruthy();
  });

  it('03. Role Name Validation with null value', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue(null);
    expect(roleName.valid).toBeFalse();
  });

  it('04. Role Name Validation with undefined value', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue(undefined);
    expect(roleName.valid).toBeFalse();
  });

  it('05. Role Name max length validation', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('sccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc');
    expect(roleName.valid).toBeFalse();
  });

  it('06. Role Name max length validation', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('sccccccccccc');
    expect(roleName.valid).toBeTruthy();
  });

  it('07. Role Name max length validation', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('sccccccccccc');
    expect(roleName.valid).toBeTruthy();
  });

  it('08. Role name validation with empty value', () => {
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('');
    expect(roleName.valid).toBeFalse();
  });

  it('09. Role name availability check validation role name is null', () => {
    spyOn<RoleCreateComponent, any>(component, 'checkRoleNameAvailability');
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('');
    component.checkRoleNameAvailability();
    expect(roleService.checkRoleNameAvailability).toHaveBeenCalledTimes(0);
  });

  it('10. Role name availability check validation role name is not null', () => {
    spyOn<RoleCreateComponent, any>(component, 'checkRoleNameAvailability');
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('role10');
    component.checkRoleNameAvailability();
    expect(roleService.checkRoleNameAvailability).not.toHaveBeenCalled();;
  });

  it('11. Role name Reset', () => {
    spyOn<RoleCreateComponent, any>(component, 'resetRoleCreation');
    component.resetRoleCreation();
    expect(component.createRoleForm.get('roleName').value).toEqual('');
  });

  it('12. Hole Form validation', () => {
    spyOn<RoleCreateComponent, any>(component, 'resetRoleCreation');
    component.resetRoleCreation();
    expect(component.createRoleForm.invalid).toBeTruthy();
  });

  it('13. Only fill role name submit form', () => {
    spyOn<RoleCreateComponent, any>(component, 'resetRoleCreation');
    component.resetRoleCreation();
    const roleName = component.createRoleForm.get('roleName');
    roleName.patchValue('role10');
    expect(component.createRoleForm.invalid).toBeFalse();
  });
});
