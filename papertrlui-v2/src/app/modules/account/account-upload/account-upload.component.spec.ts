import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {AccountService} from '../../../shared/services/accounts/account.service';
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
import {AccountUploadComponent} from './account-upload.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('AccountUploadComponent', () => {
  let component: AccountUploadComponent;
  let fixture: ComponentFixture<AccountUploadComponent>;
  let accountService: AccountService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['createAccount', 'getAccountTypes',
        'getAccountDetailTypeList', 'getParents', 'getAccountDetails'],
      ['PoUtility']);

    const commonUploadIssueServiceSpy = jasmine.createSpyObj('CommonUploadIssueService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [AccountUploadComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule, BlockUIModule, PanelModule, BrowserAnimationsModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: AccountService, useValue: accountServiceSpy},
        {provide: CommonUploadIssueService, useValue: commonUploadIssueServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(AccountUploadComponent);
      accountService = TestBed.inject(AccountService);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.ngOnInit();
    });
  });

  it('01.Download account upload template', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'downloadAccountListTemplate');
    component.downloadAccountListTemplate();
    expect(component.downloadAccountListTemplate).toHaveBeenCalledTimes(1);
  }));

  it('02.Upload button click', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'uploadAccountList');
    component.uploadAccountList();
    expect(component.uploadAccountList).toHaveBeenCalledTimes(1);
  }));

  it('03.File not select in selection', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'uploadAccountList');
    const targetFile = null;
    component.accountUploadForm.patchValue({
      file: targetFile
    });
    expect(component.accountUploadForm.get('file').value).toEqual(null);
  }));

  it('04.Click Upload button without selection file is null', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'uploadAccountList');
    const targetFile = null;
    component.accountUploadForm.patchValue({
      file: targetFile
    });
    expect(component.accountUploadForm.valid).toEqual(false);
  }));

  it('05.Click Upload button without selection file is undefined', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'uploadAccountList');
    const targetFile = undefined;
    component.accountUploadForm.patchValue({
      file: targetFile
    });
    expect(component.accountUploadForm.valid).toEqual(false);
  }));

  it('06.File not select in selection', fakeAsync(() => {
    spyOn<AccountUploadComponent, any>(component, 'uploadAccountList');
    const targetFile = null;
    component.accountUploadForm.patchValue({
      file: targetFile
    });
    expect(component.accountUploadForm.get('file').value).toEqual(null);
  }));

});
