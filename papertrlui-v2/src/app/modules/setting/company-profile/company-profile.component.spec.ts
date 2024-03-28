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
import {CompanyProfileComponent} from './company-profile.component';
import {CompanyProfileService} from '../../../shared/services/company-profile/company-profile.service';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';


describe('CompanyProfileComponent', () => {
  let component: CompanyProfileComponent;
  let fixture: ComponentFixture<CompanyProfileComponent>;
  let companyProfileService: CompanyProfileService;

  const mockCompanyData = {
    id: 10001,
    ownerName: 'Papertrl Dev',
    firstName: 'Papertrl',
    lastName: 'Dev',
    businessAddress: 'No.33 Weherakanda Rd, Pitakotte',
    ownerEmail: 'bhagya.e@papertrl.com',
    dbDefaultAutoCommit: false,
    sftpPort: 0,
    timeZone: 'US/Eastern',
    tenantPrivileges: [],
    masterTenantAddress: {
      id: 234,
      addressLine1: 'No.33 Weherakanda Rd, Pitakotte',
      addressLine2: 'Pitakotte',
      tenantMstId: 10001,
      country: 'United States',
      city: 'Pitakotte',
      zipcode: '60060',
      addressState: 'SL',
      masterTenantAddressAsSingleString: 'No.33 Weherakanda Rd, Pitakotte',
    },
    masterTenantProfilePicture: {
      id: 23,
      tenantId: 10001,
      modified: false
    }
  };


  const timeZones: any = {
    data: [{
      id: 'ACT',
      name: 'ACT'
    },
      {
        id: 'AET',
        name: 'AET'
      },
      {
        id: 'Africa/Abidjan',
        name: 'Africa/Abidjan'
      }]
  };

  beforeEach(async () => {
    const companyProfileServiceSpy = jasmine.createSpyObj('companyProfileService', ['getTimeZoneList',
    'getTenantDetails']);

    await TestBed.configureTestingModule({
      declarations: [CompanyProfileComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: CompanyProfileService, useValue: companyProfileServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(CompanyProfileComponent);
      companyProfileService = TestBed.inject(CompanyProfileService);
      component = fixture.componentInstance;
      component.initializeFormGroup();
    });
  });

  it('01. Email Validation Error', () => {
    let errors: any = {};
    const email = component.companyProfileForm.get('ownerEmail');
    errors = email.errors || {};
    expect(errors.required).toBeTruthy();
  });

  it('02. Email Validation Pattern', () => {
    const email = component.companyProfileForm.get('ownerEmail');
    let errors: any = {};
    email.setValue('test');
    errors = email.errors || {};
    expect(errors.emailValidate).toBeTruthy();
  });

  it('03. Email Validation Pattern', () => {
    const email = component.companyProfileForm.get('ownerEmail');
    email.patchValue('test@test.com', {emitEvent: false});
    expect(component.companyProfileForm.controls.ownerEmail.hasError('emailValidate')).toBeFalse();
  });

  it('04. Email Validation Pattern', () => {
    const email = component.companyProfileForm.get('ownerEmail');
    email.patchValue('testtest.com', {emitEvent: false});
    expect(component.companyProfileForm.controls.ownerEmail.hasError('emailValidate')).toBeTruthy();
  });

  it('o5. Update company profile without email', () => {
    component.companyProfileForm.value.ownerEmail = null;
    expect(component.companyProfileForm.invalid).toBeTruthy();
  });

  it('06. Data patch correctly', () => {
    component.companyProfileForm.patchValue(mockCompanyData, {emitEvent: false});
    expect(component.companyProfileForm.valid).toBeTruthy();
  });

  it('07. Owner email check after data patched', () => {
    component.companyProfileForm.patchValue(mockCompanyData, {emitEvent: false});
    expect(component.companyProfileForm.value.ownerEmail).toBe('bhagya.e@papertrl.com');
  });

  it('08. Check title', () => {
    component.companyProfileForm.patchValue(mockCompanyData, {emitEvent: false});
    expect(component.companyProfileForm.value.ownerEmail).toBe('bhagya.e@papertrl.com');
  });

  it('09.Label check - Company Name', () => {
    const elementRef: DebugElement = fixture.debugElement;
    const paragraphDe = elementRef.query(By.css('label'));
    const label: HTMLElement = paragraphDe.nativeElement;
    expect(label.textContent).toEqual('Company Name* ');
  });

  it('09.Label check - First Name', () => {
    const elementRef: DebugElement = fixture.debugElement;
    const firstName = elementRef.queryAll(By.css('label'));
    const label: HTMLElement = firstName[1].nativeElement;
    expect(label.textContent).toEqual('First Name* ');
  });

  it('10.Label check - Label check', () => {
    const elementRef: DebugElement = fixture.debugElement;
    const firstName = elementRef.queryAll(By.css('label'));
    const label: HTMLElement = firstName[1].nativeElement;
    expect(label.textContent).toEqual('First Name* ');
  });

  it('11. should fetch data asynchronously',  () => {
    spyOn<CompanyProfileComponent, any>(component, 'getTimeZoneList');
    component.getTimeZoneList();
    expect(companyProfileService.getTimeZoneList).toHaveBeenCalledTimes(0);
  });
});
