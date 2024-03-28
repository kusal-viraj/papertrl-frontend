import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ReminderConfigurationComponent} from './reminder-configuration.component';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {InputNumberModule} from "primeng/inputnumber";
import {InputSwitchModule} from "primeng/inputswitch";
import {MultiSelectModule} from "primeng/multiselect";
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {of} from "rxjs";
import {documentTypeResponse, okResponse} from "../../../shared/helpers/test-data";

describe('ReminderConfigurationComponent', () => {
  let component: ReminderConfigurationComponent;
  let fixture: ComponentFixture<ReminderConfigurationComponent>;
  let manageFeatureService: any

  beforeEach(async(() => {
    let manageFeatureServiceSpy = jasmine.createSpyObj('ManageFeatureService', ['getDocumentTypes',
      'createReminder', 'getEventListForDocument', 'getActionEnableFieldList']);
    TestBed.configureTestingModule({
      declarations: [ReminderConfigurationComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, InputNumberModule, InputSwitchModule,
        MultiSelectModule],
      providers: [MessageService, ConfirmationService,
        {provide: ManageFeatureService, useValue: manageFeatureServiceSpy}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderConfigurationComponent);
    component = fixture.componentInstance;
    manageFeatureService = TestBed.inject(ManageFeatureService);
    manageFeatureService.getDocumentTypes.and.returnValue(of(documentTypeResponse()));
    manageFeatureService.createReminder.and.returnValue(of(okResponse()));
    manageFeatureService.getEventListForDocument.and.returnValue(of(okResponse()));
    manageFeatureService.getActionEnableFieldList.and.returnValue(of(okResponse()));
    fixture.detectChanges();
  });

  it('should initialize the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get the document types', function () {
    component.getDocumentTypes();
    expect(component.documentTypeList.data.length).toBeGreaterThan(1);
  });

  it('should check the mandatory fields in form', function () {
    component.initForm();
    component.submitForm();
    expect(component.formGroup.valid).toBeFalse();
  });

  it('should call the create api when mandatory fields are filled', function () {
    component.initForm();
    component.formGroup.get('name').patchValue('name')
    component.formGroup.get('documentTypeId').patchValue(1)
    component.formGroup.get('eventId').patchValue(1)
    component.formGroup.get('frequency').patchValue(1)
    component.submitForm();
    expect(component.formGroup.valid).toBeTrue();
  });

  it('should reset the form', function () {
    component.initForm();
    component.formGroup.get('name').patchValue('name')
    component.formGroup.get('documentTypeId').patchValue(1)
    component.formGroup.get('eventId').patchValue(1)
    component.formGroup.get('frequency').patchValue(1)
    component.resetForm();
    expect(component.formGroup.valid).toBeFalse();
  });

  it('should get the event list according to document', function () {
    spyOn(component, 'getEventList');
    spyOn(component, 'getFieldList');
    component.initForm();
    component.formGroup.get('documentTypeId').patchValue(1);
    component.documentTypeChange(1, true);
    expect(component.getEventList).toHaveBeenCalled();
  });
});
