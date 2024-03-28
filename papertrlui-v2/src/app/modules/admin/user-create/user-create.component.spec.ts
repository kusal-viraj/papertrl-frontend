import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {InputMaskModule} from 'primeng/inputmask';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {ToastModule} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';
import {BillSocketService} from '../../../shared/services/bills/bill-socket.service';
import {UserCreateComponent} from './user-create.component';
import {UserService} from '../../../shared/services/user/user.service';
import {createUser} from "../../../shared/helpers/test-data";
import {isArray} from "rxjs/internal-compatibility";

describe('UserCreateComponent', () => {
  let component: UserCreateComponent;
  let fixture: ComponentFixture<UserCreateComponent>;
  let userService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['createUser', 'checkUserEmailAvailability']);

    await TestBed.configureTestingModule({
      declarations: [UserCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: UserService, useValue: userServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(UserCreateComponent);
      userService = TestBed.inject(UserService);
      component = fixture.componentInstance;
      component.initFormGroup();
    });
  });

  it('01. Email Validation Error', () => {
    let errors: any = {};
    const email = component.createUserForm.get('email');
    errors = email.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('02. Email Validation Pattern', () => {
    const email = component.createUserForm.get('email');
    let errors: any = {};
    email.setValue('test');
    errors = email.errors || {};
    expect(errors.emailValidate).toBeTruthy();
  });

  it('03. Email Validation Pattern', () => {
    const email = component.createUserForm.get('email');
    email.patchValue('test@test.com', {emitValue: false});
    expect(component.createUserForm.controls.email.hasError('emailValidate')).toBeFalse();
  });

  it('04. Email Validation Pattern', () => {
    const email = component.createUserForm.get('email');
    email.patchValue('testtest.com', {emitValue: false});
    expect(component.createUserForm.controls.email.hasError('emailValidate')).toBeTruthy();
  });

  it('05. Password Validation', () => {
    let errors: any = {};
    const password = component.createUserForm.get('password');
    errors = password.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('06. Password Validation - Min length', () => {
    const password = component.createUserForm.get('password');
    password.patchValue('12222', {emitValue: false});
    expect(component.createUserForm.get('password').errors.minlength).toBeTruthy();
  });

  it('07. Password Validation - Max-length', () => {
    const password = component.createUserForm.get('password');
    password.patchValue('12888888888888888888888888888888888888888888888888888222', {emitValue: false});
    expect(component.createUserForm.get('password').errors.maxlength).toBeTruthy();
  });

  it('08. Password and confirmation password match validation', () => {
    const password = component.createUserForm.get('password');
    const confirmPassword = component.createUserForm.get('confirmPassword');
    password.patchValue('123456789', {emitValue: false});
    confirmPassword.patchValue('123456789', {emitValue: false});
    expect(password.value === confirmPassword.value).toBeTruthy();
  });

  it('09. Validate create user form', () => {
    component.createUserForm.patchValue(component.createUserForm.value);
    expect(component.createUserForm.invalid).toBeTruthy();
  });

  it('10. Validate create user form - email', async () => {
    component.createUserForm.get('email').patchValue('scsdwdwd', {emitEvent: false});
    expect(component.createUserForm.get('email').invalid).toBeTruthy();
  });

  it('11. Validate create user form - name', () => {
    component.createUserForm.patchValue(createUser);
    expect(component.createUserForm.get('name').invalid).toBeFalse();
  });

  it('12. Patch invalid email format', () => {
    let user: any = {};
    user = createUser;
    user.email = 'adcgmail.com'
    component.createUserForm.patchValue(user);
    expect(component.createUserForm.get('email').invalid).toBeTruthy();
  });

  it('13. Check PrevGroups controller value', () => {
    let PrevGroups = [1, 2, 3];
    component.createUserForm.get('approvalGroups').patchValue(PrevGroups);
    expect(isArray(component.createUserForm.get('approvalGroups').value)).toBeTruthy();
  });


  it('14. Check PrevGroups controller value', () => {
    let PrevGroups = {};
    component.createUserForm.get('approvalGroups').patchValue(PrevGroups);
    expect(isArray(component.createUserForm.get('approvalGroups').value)).toBeFalse();
  });

  it('15. call CheckAvailability method with email', () => {
    spyOn<UserCreateComponent, any>(component, 'checkAvailability');
    component.checkAvailability(component.createUserForm.value);
    expect(component.checkAvailability).toHaveBeenCalledTimes(1);
  });

  it('16. call CheckAvailability method with empty space', () => {
    spyOn<UserCreateComponent, any>(component, 'checkAvailability');
    component.createUserForm.controls['email'].patchValue(' ');
    component.checkAvailability(component.createUserForm.value.email);
    expect(userService.checkUserEmailAvailability).toHaveBeenCalledTimes(0);
  });

  it('17. call CheckAvailability method with empty space', () => {
    spyOn<UserCreateComponent, any>(component, 'checkAvailability');
    component.createUserForm.controls['email'].patchValue('damith.a@gmail.com');
    userService.checkUserEmailAvailability(component.createUserForm.value.email);
    expect(userService.checkUserEmailAvailability).toHaveBeenCalledTimes(1);
  });

  it('18. Check async method for patch value to approval group', fakeAsync(() => {
    spyOn<UserCreateComponent, any>(component, 'setDefaultValue');
    tick(500);
    fixture.whenStable().then(() => {
      expect(component.setDefaultValue).toHaveBeenCalledTimes(0);
    })
  }));

  it('19. Check async method for patch value to approval group', fakeAsync(() => {
    spyOn<UserCreateComponent, any>(component, 'setDefaultValue');
    tick(1000);
    fixture.whenStable().then(() => {
      expect(component.setDefaultValue).toHaveBeenCalledTimes(0);
    })
  }));

  it('20. Check async method for patch value to approval group', fakeAsync(() => {
    spyOn<UserCreateComponent, any>(component, 'setDefaultValue');
    tick(1500);
    component.setDefaultValue();
    fixture.whenStable().then(() => {
      expect(component.setDefaultValue).toHaveBeenCalledTimes(1);
    })
  }));

  it('21. Check async method for patch value to approval group', fakeAsync(() => {
    spyOn<UserCreateComponent, any>(component, 'setDefaultValue');
    tick(1501);
    component.setDefaultValue();
    fixture.whenStable().then(() => {
      expect(component.setDefaultValue).toHaveBeenCalledTimes(1);
    })
  }));

  it('22. Check async method for patch value to role id', fakeAsync(() => {
    spyOn<UserCreateComponent, any>(component, 'addNewRoleClicked');
    component.addNewRoleClicked(1, 'Role01');
    tick(6000);
    fixture.whenStable().then(() => {
      expect(component.createUserForm.value.roleId).toBe(null);
    })
  }));

});
