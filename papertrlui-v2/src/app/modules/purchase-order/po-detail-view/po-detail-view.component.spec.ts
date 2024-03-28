import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PoDetailViewComponent} from './po-detail-view.component';
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
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonImplModule} from '../../common/common-impl.module';

describe('PoDetailViewComponent', () => {
  let component: PoDetailViewComponent;
  let fixture: ComponentFixture<PoDetailViewComponent>;
  let additionalFieldService: AdditionalFieldService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PoDetailViewComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule, CommonImplModule],
      providers: [MessageService, ConfirmationService],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoDetailViewComponent);
    component = fixture.componentInstance;
    additionalFieldService = TestBed.inject(AdditionalFieldService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Validate get request Po Id is not null', () => {
    component.poId = 10;
    spyOn<PoDetailViewComponent, any>(component, 'getPoDetails');
    component.getPoDetails(AppConstant.ONE);
    expect(component.getPoDetails).toHaveBeenCalledTimes(AppConstant.ONE);
  });

  it('Validate get request Po Id is not undefined', () => {
    component.poId = 10;
    spyOn<PoDetailViewComponent, any>(component, 'getPoDetails');
    component.getPoDetails(1);
    expect(component.getPoDetails).toHaveBeenCalledTimes(AppConstant.ONE);
  });

  it('Validate get request Po Id is not undefined', () => {
    component.poId = 10;
    spyOn<PoDetailViewComponent, any>(component, 'getPoDetails');
    component.getPoDetails(1);
    expect(component.getPoDetails).toHaveBeenCalledTimes(AppConstant.ONE);
  });

  it('Validate additional data get request module id is not null', () => {
    spyOn<PoDetailViewComponent, any>(component, 'getModuleReheatedAdditionalField');
    component.getModuleReheatedAdditionalField(1, false);
    expect(component.getModuleReheatedAdditionalField).toHaveBeenCalled();
  });

  it('Validate additional data get request module id is null', () => {
    spyOn<AdditionalFieldService, any>(additionalFieldService, 'getAdditionalField');
    component.getModuleReheatedAdditionalField(null, false);
    expect(additionalFieldService.getAdditionalField).toHaveBeenCalledTimes(AppConstant.ZERO);
  });
});
