import {AccountUploadComponent} from '../../account/account-upload/account-upload.component';
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
import {ItemCreateComponent} from './item-create.component';
import {ItemService} from '../../../shared/services/items/item.service';
import {DebugElement} from '@angular/core';
import {mockItemObject} from '../../../shared/helpers/test-data';

describe('ItemCreateComponent', () => {
  let component: ItemCreateComponent;
  let fixture: ComponentFixture<ItemCreateComponent>;
  let itemService: ItemService;
  let el: DebugElement;

  beforeEach(async () => {
    const billSocketServiceSpy = jasmine.createSpyObj('BillSocketService', ['disconnect']);
    const itemServiceSpy = jasmine.createSpyObj('ItemService', ['createItem', 'getItemType'],
      ['ItemUtility']);

    await TestBed.configureTestingModule({
      declarations: [AccountUploadComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: BillSocketService, useValue: billSocketServiceSpy},
        {provide: ItemService, useValue: itemServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(ItemCreateComponent);
      itemService = TestBed.inject(ItemService);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      await component.initializeFormBuilder();
      component.addItemLine();
    });
  });

  it('01. Validate Item Detail Table Count', (() => {
    expect(component.commonItemDetails.length).toEqual(10);
  }));

  it('02. Validate downloadItemImage function item id null', (() => {
    component.itemID = 1;
    spyOn<ItemCreateComponent, any>(component, 'downloadItemImage');
    expect(component.downloadItemImage).toHaveBeenCalledTimes(0);
  }));


  it('03 Item Number max length validation', () => {
    component.createItemForm.get('itemNumber').patchValue('1ffffffffffffdcdcdcfffffffffffffffffffffffffffffffffffffffffffffffffffffff2');
    expect(component.createItemForm.controls.itemNumber.hasError('maxlength')).toBeTruthy();
  });

  it('04 item number max length validator', () => {
    component.createItemForm.get('itemNumber').patchValue('3333333333333333332');
    expect(component.createItemForm.controls.itemNumber.hasError('maxlength')).toBeFalse();
  });

  it('05 Item name max length validation', () => {
    component.createItemForm.get('name').patchValue('1ffffffffffffdcdcdcf555151ffffffffffffffffffffffffffffffffffffffffffffffffffffff2');
    expect(component.createItemForm.controls.name.hasError('maxlength')).toBeTruthy();
  });

  it('06 Item name max length validator', () => {
    component.createItemForm.get('name').patchValue('3333333333333333332');
    expect(component.createItemForm.controls.name.hasError('maxlength')).toBeFalse();
  });

  it('07 Validation check', () => {
    mockItemObject.itemTypeId = 1;
    mockItemObject.name = 'efef';
    component.createItemForm.patchValue(mockItemObject, {emitEvent: false});
    expect(component.createItemForm.valid).toBeTruthy();
  });


  it('08 Validation check', () => {
    mockItemObject.itemTypeId = 1;
    mockItemObject.name = 'efef';
    component.createItemForm.patchValue(mockItemObject, {emitEvent: false});
    expect(component.createItemForm.valid).toBeTruthy();
  });

  it('09 Validation check', () => {
    mockItemObject.itemTypeId = null;
    component.createItemForm.patchValue(mockItemObject, {emitEvent: false});
    expect(component.createItemForm.valid).toBeFalse();
  });

  it('10 Validation check', () => {
    mockItemObject.itemTypeId = 1;
    component.createItemForm.patchValue(mockItemObject, {emitEvent: false});
    expect(component.createItemForm.valid).toBeTruthy();
  });
});
