import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {InputMaskModule} from 'primeng/inputmask';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {ToastModule} from 'primeng/toast';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {PoNumberConfigurationComponent} from './po-number-configuration.component';
import {PoNumberConfigureService} from '../../../shared/services/po-number-configuration/po-number-configure.service';


describe('PoNumberConfigurationComponent', () => {
  let component: PoNumberConfigurationComponent;
  let fixture: ComponentFixture<PoNumberConfigurationComponent>;
  let poNumberConfigureService: PoNumberConfigureService;

  const inValidLengthValue = '193838737777777777777766565222222222222222222222222222222778899999999999999999999999';
  const validLengthValue = '19383873777777';

  const mockPONumberConfigurationObj = {
    id: 4,
    createdBy: 'bhagya.e@papertrl.com',
    createdOn: 1646294825000,
    departmentId: 0,
    departmentName: 'All',
    prefixes: '1000',
    suffixes: '**',
    separatorSymbol: 2,
    runningNo: 1000,
    override: 'N',
    poNoPattern: '1000#1000#**',
    status: 'A',
    createdUserName: 'Papertrl Dev'
  };

  beforeEach(async () => {

    const PoNumberConfigureServiceServiceSpy = jasmine.createSpyObj('PoNumberConfigureService',
      ['createPurchaseOrderNumberFormat']);

    await TestBed.configureTestingModule({
      declarations: [PoNumberConfigurationComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService, ManageFeatureService,
        {provide: PoNumberConfigureService, useValue: PoNumberConfigureServiceServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoNumberConfigurationComponent);
      poNumberConfigureService = TestBed.inject(PoNumberConfigureService);
      component = fixture.componentInstance;
      component.initializeFormBuilder();
    });
  });

  it('01. Check form builder availability', () => {
    expect(component.poNumberConfigurationForm.controls).toBeDefined();
  });

  it('02. Validation of runningNo', () => {
    expect(component.poNumberConfigurationForm.controls.runningNo.validator).toBeDefined();
  });

  it('03. Validation of departmentId', () => {
    expect(component.poNumberConfigurationForm.controls.departmentId.validator).toBeDefined();
  });

  it('04. Validation of separatorSymbol', () => {
    expect(component.poNumberConfigurationForm.controls.separatorSymbol.validator).toBe(null);
  });

  it('05. Validation of prefixes', () => {
    expect(component.poNumberConfigurationForm.controls.prefixes.validator).toBe(null);
  });

  it('06. Validation of runningNo', async () => {
    await component.poNumberConfigurationForm.get('runningNo').patchValue('333333333323232333333', {emitEvent: false});
    expect(component.poNumberConfigurationForm.controls.runningNo.hasError('maxlength')).toBeTruthy();
  });

  it('07. Validation of runningNo', async () => {
    await component.poNumberConfigurationForm.get('runningNo').patchValue('333333333323232333333', {emitEvent: false});
    expect(component.poNumberConfigurationForm.controls.runningNo.hasError('maxlength')).toBeTruthy();
  });

  it('08.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('prefixes').patchValue(inValidLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.prefixes = component.poNumberConfigurationForm.get('prefixes').value;
    expect(component.createPoNoConfig).toHaveBeenCalledTimes(0);
  });

  it('09.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('suffixes').patchValue(inValidLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.suffixes = component.poNumberConfigurationForm.get('suffixes').value;
    expect(component.createPoNoConfig).toHaveBeenCalledTimes(0);
  });

  it('10.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('suffixes').patchValue(inValidLengthValue, {emitEvent: false});
    component.poNumberConfigurationForm.get('prefixes').patchValue(inValidLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.prefixes = component.poNumberConfigurationForm.get('prefixes').value;
    mockPONumberConfigurationObj.suffixes = component.poNumberConfigurationForm.get('suffixes').value;
    expect(component.createPoNoConfig).toHaveBeenCalledTimes(0);
  });

  it('11.Check call status of createPoNumberConfiguration', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    component.poNumberConfigurationForm.get('prefixes').patchValue(validLengthValue, {emitEvent: false});
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });

  it('12.Check call status of createPoNumberConfiguration', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    component.poNumberConfigurationForm.get('prefixes').patchValue(validLengthValue, {emitEvent: false});
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });

  it('13.Check call status of createPoNumberConfiguration', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    component.poNumberConfigurationForm.get('suffixes').patchValue(validLengthValue, {emitEvent: false});
    component.poNumberConfigurationForm.get('prefixes').patchValue(validLengthValue, {emitEvent: false});
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });

  it('14.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('prefixes').patchValue(validLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.prefixes = component.poNumberConfigurationForm.get('prefixes').value;
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });

  it('15.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('suffixes').patchValue(validLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.suffixes = component.poNumberConfigurationForm.get('suffixes').value;
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });

  it('16.Check call status of createPoNoConfig', async () => {
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNumberConfiguration');
    spyOn<PoNumberConfigurationComponent, any>(component, 'createPoNoConfig');
    component.poNumberConfigurationForm.get('suffixes').patchValue(validLengthValue, {emitEvent: false});
    component.poNumberConfigurationForm.get('prefixes').patchValue(validLengthValue, {emitEvent: false});
    mockPONumberConfigurationObj.prefixes = component.poNumberConfigurationForm.get('prefixes').value;
    mockPONumberConfigurationObj.suffixes = component.poNumberConfigurationForm.get('suffixes').value;
    component.createPoNumberConfiguration(mockPONumberConfigurationObj);
    expect(component.createPoNumberConfiguration).toHaveBeenCalledTimes(1);
  });


});
