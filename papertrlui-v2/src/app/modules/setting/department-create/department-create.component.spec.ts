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
import {DepartmentCreateComponent} from './department-create.component';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';


describe('DepartmentCreateComponent', () => {
  let component: DepartmentCreateComponent;
  let fixture: ComponentFixture<DepartmentCreateComponent>;
  let departmentService: DepartmentService;

  const departmentMockObject: any = {
    id: 4,
    createdBy: 'nirondissanayake@gmail.com',
    createdOn: 1626421703000,
    uuid: 'b8630763-2966-4b39-bf44-f49607bd441d',
    departmentCode: '4',
    departmentName: 'HR department',
    status: 'A',
    departmentWithCode: 'HR department - 4'
  };

  beforeEach(async () => {
    const departmentServiceSpy = jasmine.createSpyObj('companyProfileService', ['createDepartment']);

    await TestBed.configureTestingModule({
      declarations: [DepartmentCreateComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: DepartmentService, useValue: departmentServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(DepartmentCreateComponent);
      departmentService = TestBed.inject(DepartmentService);
      component = fixture.componentInstance;
      component.initializeFormBuilder();
    });
  });

  it('01.Department Code Validation Check', () => {
    let errors: any = {};
    const departmentCode = component.departmentForm.get('departmentCode');
    errors = departmentCode.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('02.Department Name Validation Check', () => {
    let errors: any = {};
    const departmentName = component.departmentForm.get('departmentName');
    errors = departmentName.errors || {};
    expect(errors.required).toBeTruthy();
  });


  it('03.After success call emit event', () => {
    let errors: any = {};
    const departmentName = component.departmentForm.get('departmentName');
    errors = departmentName.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('04.Call submit form method', () => {
    spyOn(component, 'submitForm');
    component.submitForm();
    expect(component.submitForm).toHaveBeenCalledTimes(1);
  });

  it('05.Form validation', async (done: DoneFn) => {
    await component.departmentForm.patchValue(departmentMockObject);
    expect(component.departmentForm.valid).toBeTruthy();
    done();
  });

  it('06.Form validation', async (done: DoneFn) => {
    await component.departmentForm.patchValue(departmentMockObject);
    expect(component.departmentForm.valid).toBeTruthy();
    done();
  });


  it('07.Label check - Department Code', () => {
    const elementRef: DebugElement = fixture.debugElement;
    const paragraphDe = elementRef.query(By.css('label'));
    const label: HTMLElement = paragraphDe.nativeElement;
    expect(label.textContent).toEqual('Enter Department Code* ');
  });

  it('08.Label check - Department Name', () => {
    const elementRef: DebugElement = fixture.debugElement;
    const firstName = elementRef.queryAll(By.css('label'));
    const label: HTMLElement = firstName[1].nativeElement;
    expect(label.textContent).toEqual('Enter Department Name* ');
  });

  it('09.Reset button', async (done: DoneFn) => {
    spyOn(component, 'reset');
    component.reset();
    expect(component.departmentForm.valid).toBeFalsy();
    done();
  });

  it('10.Reset button - Department Name', async (done: DoneFn) => {
    spyOn(component, 'reset');
    component.reset();
    expect(component.departmentForm.controls.departmentName.valid).toBeFalsy();
    done();
  });

  it('11.Reset button - Department Code', async (done: DoneFn) => {
    spyOn(component, 'reset');
    component.reset();
    expect(component.departmentForm.controls.departmentCode.valid).toBeFalsy();
    done();
  });

});
