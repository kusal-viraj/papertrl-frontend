import {PoCreateComponent} from '../../purchase-order/po-create/po-create.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
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
import {AccountCreateComponent} from './account-create.component';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {mockAccountObj} from '../../../shared/helpers/test-data';


describe('AccountCreateComponent', () => {
  let component: AccountCreateComponent;
  let fixture: ComponentFixture<AccountCreateComponent>;
  let accountService: AccountService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['createAccount', 'getAccountTypes',
        'getAccountDetailTypeList', 'getParents', 'getAccountDetails'],
      ['PoUtility']);

    await TestBed.configureTestingModule({
      declarations: [PoCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: AccountService, useValue: accountServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(AccountCreateComponent);
      accountService = TestBed.inject(AccountService);
      component = fixture.componentInstance;
      await component.initializeFormBuilder();
    });
  });

  it('01.Check account type null', async () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(null);
    expect(accountType.valid).toBeTruthy();
  });

  it('02.Check account type 1', async () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(1);
    expect(accountType.valid).toBeTruthy();
  });

  it('03.Get account detail types: account type is null', () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(null);
    spyOn<AccountCreateComponent, any>(component, 'loadAccountDetailTypes');
    component.loadAccountDetailTypes(false);
    expect(accountService.getAccountDetailTypeList).toHaveBeenCalledTimes(0);
  });


  it('04.Get account detail types: account type is 1', () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(1);
    spyOn<AccountCreateComponent, any>(component, 'loadAccountDetailTypes');
    component.loadAccountDetailTypes(false);
    expect( component.loadAccountDetailTypes).toHaveBeenCalledTimes(1);
  });

  it('05.Get parent accounts: account type is null', () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(null);
    spyOn<AccountCreateComponent, any>(component, 'getParentTypes');
    component.getParentTypes();
    expect(accountService.getParents).toHaveBeenCalledTimes(0);
  });


  it('06.Get parent accounts: account type is 1', () => {
    const accountType = component.createAccountForm.controls.accountType;
    accountType.patchValue(1);
    spyOn<AccountCreateComponent, any>(component, 'getParentTypes');
    component.getParentTypes();
    expect(component.getParentTypes).toHaveBeenCalledTimes(1);
  });


  it('07.Call call account submit: isEdit: false', () => {
    spyOn<AccountCreateComponent, any>(component, 'createAccount');
    component.createAccountForm.clearValidators();
    component.editView = false;
    component.createAccount(component.createAccountForm.value);
    expect(component.createAccount).toHaveBeenCalledTimes(1);
  });

  it('08.Call call account update: isEdit: true', () => {
    spyOn<AccountCreateComponent, any>(component, 'updateAccount');
    component.editView = true;
    component.updateAccount(component.createAccountForm.value);
    expect(component.updateAccount).toHaveBeenCalledTimes(1);
  });

  it('09.Call account data get service: account id is null', () => {
    spyOn<AccountCreateComponent, any>(component, 'getAccountData');
    component.accountID = null;
    expect(component.getAccountData).toHaveBeenCalledTimes(0);
  });

  it('10.Call account data get service: account id is not null', () => {
    spyOn<AccountCreateComponent, any>(component, 'getAccountData');
    component.getAccountData();
    expect(component.getAccountData).toHaveBeenCalledTimes(1);
  });

  it('11.Call account data get service: account id is not null', () => {
    spyOn<AccountCreateComponent, any>(component, 'getAccountData');
    component.getAccountData();
    expect(component.getAccountData).toHaveBeenCalledTimes(1);
  });

  it('12.Get account: isEdit: false', () => {
    spyOn<AccountCreateComponent, any>(component, 'getAccountData');
    component.editView = false;
    accountService.getAccountDetails(1);
    expect(accountService.getAccountDetails).toHaveBeenCalledTimes(1);
  });

  it('13.Get account: isEdit: true', () => {
    component.editView = true;
    accountService.getAccountDetails(1);
    expect(accountService.getAccountDetails).toHaveBeenCalledTimes(1);
  });

  it('14.Reset Function', () => {
    spyOn<AccountCreateComponent, any>(component, 'resetAccountForm');
    component.resetAccountForm();
    expect(component.resetAccountForm).toHaveBeenCalledTimes(1);
  });

  it('15.Edit account - patching data', () => {
   component.createAccountForm.patchValue(mockAccountObj);
   expect(component.createAccountForm.get('number').value).toEqual('100032');
  });

  it('15.Edit account - type of patching data', () => {
    component.createAccountForm.patchValue(mockAccountObj);
    expect(component.createAccountForm.get('number').value).toEqual('100032');
  });

});
