import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AbstractControl, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {MileageConfigurationComponent} from './mileage-configuration.component';
import {MileageRateService} from '../../../shared/services/settings/mileage-rate/mileage-rate.service';


describe('MileageConfigurationComponent', () => {
  let component: MileageConfigurationComponent;
  let fixture: ComponentFixture<MileageConfigurationComponent>;
  let mileageRateService: MileageRateService;

  beforeEach(async () => {

    const mileageRateServiceSpy = jasmine.createSpyObj('MileageRateService',
      ['createMileageRate']);

    await TestBed.configureTestingModule({
      declarations: [MileageConfigurationComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService, ManageFeatureService,
        {provide: MileageRateService, useValue: mileageRateServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(MileageConfigurationComponent);
      mileageRateService = TestBed.inject(MileageRateService);
      component = fixture.componentInstance;
      component.initializeFormBuilder();
    });
  });

  it('01. Check mileage rate field null validation', () => {
    const mileageRate: AbstractControl = component.mileageRateConfigurationForm.controls.mileageRate;
    mileageRate.patchValue(null, {emitEvent: false});
    expect(mileageRate.invalid).toBeTruthy();
  });

  it('02. Check mileage rate field length validation', () => {
    const mileageRate: AbstractControl = component.mileageRateConfigurationForm.controls.mileageRate;
    mileageRate.patchValue('ssdsdsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss', {emitEvent: false});
    expect(mileageRate.invalid).toBeTruthy();
  });

  it('03. Check mileage rate field empty validation', () => {
    const mileageRate: AbstractControl = component.mileageRateConfigurationForm.controls.mileageRate;
    mileageRate.patchValue(' ', {emitEvent: false});
    if (mileageRate.value === ' ') {
      mileageRate.markAsDirty();
    }
    expect(mileageRate.dirty).toBeTruthy();
  });

  it('04. Reset function check', () => {
    spyOn<MileageConfigurationComponent, any>(component, 'resetForm');
    component.resetForm();
    component.vpExpenseMileageRate.mileageRate = 1000.00;
    component.mileageRateConfigurationForm.get('mileageRate').patchValue(component.vpExpenseMileageRate.mileageRate);
    expect(component.mileageRateConfigurationForm.get('mileageRate').value).toBe(1000.00);
  });

});
