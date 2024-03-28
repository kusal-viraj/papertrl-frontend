import {AccountUploadComponent} from '../../account/account-upload/account-upload.component';
import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
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
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {ItemService} from '../../../shared/services/items/item.service';
import {ItemUploadComponent} from './item-upload.component';
import {BlockUIModule} from 'primeng/blockui';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PanelModule} from 'primeng/panel';

describe('ItemUploadComponent', () => {
  let component: ItemUploadComponent;
  let fixture: ComponentFixture<ItemUploadComponent>;
  let itemService: ItemService;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const itemServiceSpy = jasmine.createSpyObj('ItemService', ['createItem', 'getItemType'],
      ['ItemUtility']);

    const commonUploadIssueServiceSpy = jasmine.createSpyObj('CommonUploadIssueService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [AccountUploadComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule, BlockUIModule, PanelModule, BrowserAnimationsModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: ItemService, useValue: itemServiceSpy},
        {provide: CommonUploadIssueService, useValue: commonUploadIssueServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(ItemUploadComponent);
      itemService = TestBed.inject(ItemService);
      component = fixture.componentInstance;

    });
  });

  it('01.Download item upload template', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'downloadItemUploadTemplate');
    component.downloadItemUploadTemplate();
    expect(component.downloadItemUploadTemplate).toHaveBeenCalledTimes(1);
  }));

  it('02.Upload button click', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'uploadItemList');
    component.uploadItemList();
    expect(component.uploadItemList).toHaveBeenCalledTimes(1);
  }));

  it('03.File not select in selection', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'uploadItemList');
    const targetFile = null;
    component.uploadItemForm.patchValue({
      file: targetFile
    });
    expect(component.uploadItemForm.get('file').value).toEqual(null);
  }));

  it('04.Click Upload button without selection file is null', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'uploadItemList');
    const targetFile = null;
    component.uploadItemForm.patchValue({
      file: targetFile
    });
    expect(component.uploadItemForm.valid).toEqual(false);
  }));

  it('05.Click Upload button without selection file is undefined', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'uploadItemList');
    const targetFile = undefined;
    component.uploadItemForm.patchValue({
      file: targetFile
    });
    expect(component.uploadItemForm.valid).toEqual(false);
  }));

  it('06.File not select in selection', fakeAsync(() => {
    spyOn<ItemUploadComponent, any>(component, 'uploadItemList');
    const targetFile = null;
    component.uploadItemForm.patchValue({
      file: targetFile
    });
    expect(component.uploadItemForm.get('file').value).toEqual(null);
  }));


});
