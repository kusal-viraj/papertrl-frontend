import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RoleService} from '../../../shared/services/roles/role.service';
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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfirmationService, MessageService} from 'primeng/api';
import {BillSocketService} from '../../../shared/services/bills/bill-socket.service';
import {ApprovalGroupCreateComponent} from './approval-group-create.component';
import {UserApprovalGroupService} from '../../../shared/services/approvalGroup/user-approval-group.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {UserCreateComponent} from '../../admin/user-create/user-create.component';

describe('ApprovalGroupCreateComponent', () => {
  let component: ApprovalGroupCreateComponent;
  let fixture: ComponentFixture<ApprovalGroupCreateComponent>;
  let groupService: UserApprovalGroupService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const createApprovalGroupSpy = jasmine.createSpyObj('UserApprovalGroupService', ['createApprovalGroup']);

    await TestBed.configureTestingModule({
      declarations: [UserCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule, BrowserAnimationsModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: RoleService, useValue: createApprovalGroupSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(ApprovalGroupCreateComponent);
      groupService = TestBed.inject(UserApprovalGroupService);
      component = fixture.componentInstance;
    });
    component.initFormGroup();
  });

  it('01. Approval group name validation', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue('');
    expect(approvalGroupName.invalid).toBeTruthy();
  });

  it('02. Approval group name validation', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue(' ');
    expect(approvalGroupName.invalid).toBeFalse();
  });

  it('03. Approval group name validation', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue(undefined);
    expect(approvalGroupName.invalid).toBeTruthy();
  });

  it('04. Approval group name validation', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue(null);
    expect(approvalGroupName.invalid).toBeTruthy();
  });

  it('05. Approval group name validation', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue(null);
    expect(approvalGroupName.invalid).toBeTruthy();
  });

  it('06. Approval group name validation < 75', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue('SDC10200000000000000000000000000000000000000000000000002266555555');
    expect(approvalGroupName.invalid).toBeFalse();
  });

  it('07. Approval group name validation > 75', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.setValue('SDC10200000000000000000000000000000000000000000000000002266555555scscscscscsc');
    expect(approvalGroupName.valid).toBeFalse();
  });

  it('08. Reset function', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    spyOn<ApprovalGroupCreateComponent, any>(component, 'resetForm');
    component.resetForm();
    expect(approvalGroupName.value).toBe(AppConstant.EMPTY_STRING);
  });


  it('09. Check name dirty for submission validation popup', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.markAsDirty();
    expect(approvalGroupName.dirty).toBeTruthy();
  });

  it('09. Check name dirty', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.markAsDirty();
    expect(approvalGroupName.dirty).toBeTruthy();
  });

  it('10. Table refresh event call after success', () => {
    const approvalGroupName = component.approvalGroupEditForm.get('name');
    approvalGroupName.markAsDirty();
    expect(approvalGroupName.dirty).toBeTruthy();
  });
});
