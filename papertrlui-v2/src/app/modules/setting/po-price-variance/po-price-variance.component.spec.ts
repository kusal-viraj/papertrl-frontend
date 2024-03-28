import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
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
import {PoService} from '../../../shared/services/po/po.service';
import {ToastModule} from 'primeng/toast';
import {PoPriceVarianceComponent} from './po-price-variance.component';
import {PoPriceVarianceService} from '../../../shared/services/settings/po-price-variance/po-price-variance.service';
import {PoCreateComponent} from '../../purchase-order/po-create/po-create.component';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';


describe('PoCreateComponent', () => {
  let component: PoPriceVarianceComponent;
  let fixture: ComponentFixture<PoPriceVarianceComponent>;
  let poPriceVarianceService: PoPriceVarianceService;
  let poService: PoService;

  const mockVendorList = [
    {
      id: 64,
      name: 'ABC1',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 46,
      name: 'bdbdb',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 4,
      name: 'Ben10',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 12,
      name: 'Benz',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 41,
      name: 'BTech',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 70,
      name: 'cc',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 5,
      name: 'CCB',
      trueFalseData: false,
      inactive: false
    },
    {
      id: 67,
      name: 'Cerandib',
      trueFalseData: false,
      inactive: false
    },
    {
      id: 73,
      name: 'conf1-Ven',
      trueFalseData: true,
      inactive: false
    },
    {
      id: 21,
      name: 'Abc',
      trueFalseData: false,
      inactive: true
    },
    {
      id: 53,
      name: 'Damro',
      trueFalseData: false,
      inactive: false
    },
  ];

  const mockPOVarianceObject = {
    id: 15,
    createdBy: 'bhagya.e@papertrl.com',
    createdOn: 1646294370000,
    vendorId: 0,
    vendorName: 'All',
    priceVariance: 200,
    percentage: false,
    status: 'A',
    createdUserName: 'Papertrl Dev'
  };

  beforeEach(async () => {

    const poPriceVarianceServiceSpy = jasmine.createSpyObj('PoPriceVarianceService',
      ['createPoPriceVariance', 'isVendorExists']);

    const poServiceSpy = jasmine.createSpyObj('PoService',
      ['getVendorList']);

    await TestBed.configureTestingModule({
      declarations: [PoPriceVarianceComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService, ManageFeatureService,
        {provide: PoPriceVarianceService, useValue: poPriceVarianceServiceSpy},
        {provide: PoService, useValue: poServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoPriceVarianceComponent);
      poPriceVarianceService = TestBed.inject(PoPriceVarianceService);
      poService = TestBed.inject(PoService);
      component = fixture.componentInstance;
      await component.initializeFormGroup();
    });
  });

  it('01. Check vendorId field required validation', () => {
    const vendorId = component.poPriceConfigurationForm.controls.vendorId;
    expect(vendorId.invalid).toBeTruthy();
  });

  it('02. Form Validation', () => {
    const vendorId = component.poPriceConfigurationForm.controls.vendorId;
    vendorId.patchValue(null, {emitValue: false});
    spyOn<PoPriceVarianceComponent, any>(component, 'checkWhetherVendorHasConfiguration');
    expect(component.checkWhetherVendorHasConfiguration).toHaveBeenCalledTimes(0);
  });

  it('03. Check default value of vendor selection', fakeAsync(() => {
    spyOn<PoPriceVarianceComponent, any>(component, 'getVendorList');
    spyOn<PoPriceVarianceComponent, any>(component, 'checkVendorIsExist');
    component.isEditPoNumberPriceConfiguration = false;
    const vendorList = new DropdownDto();
    vendorList.addAll();
    vendorList.addNewWithAddAll();
    vendorList.data.push(mockVendorList);
    setTimeout(() => {
      component.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).
      patchValue(vendorList.data[AppConstant.ONE].id, {emitEvent: false});
    }, AppConstant.DATA_PATCH_TIME_OUT);
    tick(100);
    expect(component.poPriceConfigurationForm.value.vendorId).toBe(0);
  }));

  it('04. Check Add new in the dropdown', fakeAsync(() => {
    spyOn<PoPriceVarianceComponent, any>(component, 'getVendorList');
    spyOn<PoPriceVarianceComponent, any>(component, 'checkVendorIsExist');
    component.isEditPoNumberPriceConfiguration = false;
    const vendorList = new DropdownDto();
    vendorList.addAll();
    vendorList.addNewWithAddAll();
    vendorList.data.push(mockVendorList);
    setTimeout(() => {
      component.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).
      patchValue(vendorList.data[AppConstant.ZERO].id, {emitEvent: false});
    }, AppConstant.DATA_PATCH_TIME_OUT);
    tick(100);
    expect(component.poPriceConfigurationForm.value.vendorId).toBe(-1);
  }));

  it('05. Check patch data on edit mode - vendorId', () => {
    component.poPriceConfigurationForm.patchValue(mockPOVarianceObject);
    expect(component.poPriceConfigurationForm.value.vendorId).toBe(mockPOVarianceObject.vendorId);
  });

  it('06. Check patch data on edit mode - amount', () => {
    component.poPriceConfigurationForm.patchValue(mockPOVarianceObject);
    expect(component.poPriceConfigurationForm.value.priceVariance).toBe(mockPOVarianceObject.priceVariance);
  });

  it('07. Check Add new in the dropdown', fakeAsync(() => {
    spyOn<PoPriceVarianceComponent, any>(component, 'getVendorList');
    spyOn<PoPriceVarianceComponent, any>(component, 'checkVendorIsExist');
    component.isEditPoNumberPriceConfiguration = false;
    const vendorList = new DropdownDto();
    vendorList.addAll();
    vendorList.addNewWithAddAll();
    vendorList.data.push(mockVendorList);
    setTimeout(() => {
      component.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).
      patchValue(vendorList.data[AppConstant.ZERO].id, {emitEvent: false});
    }, AppConstant.DATA_PATCH_TIME_OUT);
    tick(100);
    expect(component.poPriceConfigurationForm.value.vendorId).toBe(-1);
  }));

  it('08. Check reset functionality - priceVariance default patch null', () => {
    component.poPriceConfigurationForm.patchValue(mockPOVarianceObject, {emitEvent: false});
    spyOn<PoPriceVarianceComponent, any>(component, 'resetPoPriceVarianceForm');
    component.poPriceConfigurationForm.reset();
    expect(component.poPriceConfigurationForm.value.priceVariance).toBe(null);
  });
});
