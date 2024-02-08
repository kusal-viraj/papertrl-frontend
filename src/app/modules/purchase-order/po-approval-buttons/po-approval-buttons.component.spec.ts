import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {NgxDropzoneModule} from "ngx-dropzone";
import {SplitterModule} from "@progress/kendo-angular-layout";
import {ConfirmationService, MessageService} from "primeng/api";
import {PoService} from "../../../shared/services/po/po.service";
import {PoApprovalButtonsComponent} from "./po-approval-buttons.component";
import {PoMasterDto} from "../../../shared/dto/po/po-master-dto";
import {ToastModule} from "primeng/toast";

describe('PoApprovalButtonsComponent', () => {

  let component: PoApprovalButtonsComponent;
  let fixture: ComponentFixture<PoApprovalButtonsComponent>;
  let poService;

  beforeEach(async () => {

    TestBed.configureTestingModule({
      declarations: [PoApprovalButtonsComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        SplitterModule, ToastModule],
      providers: [MessageService, ConfirmationService]
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoApprovalButtonsComponent);
      poService = TestBed.inject(PoService);
      component = fixture.componentInstance;
      component.poMasterDto = new PoMasterDto();
      component.ngOnInit();
    });
  });

  it('01 Not any mandatory fields', async () => {
    expect(component.poSubmitForm.valid).toBeTruthy();
  });

  it('02 button should be approve and finalize', async () => {
    component.poMasterDto.noOfLevels = 1;
    component.poMasterDto.workflowLevel = 1;
    spyOn<PoApprovalButtonsComponent, any>(component, 'validateButtons');
    component.validateButtons();
    expect(component.isApproveAndFinalize).toBeTruthy();
  });

  it('03 button should be approve button', async () => {
    component.poMasterDto.noOfLevels = 2;
    component.poMasterDto.workflowLevel = 1;
    spyOn<PoApprovalButtonsComponent, any>(component, 'validateButtons');
    component.validateButtons();
    expect(component.isApprove).toBeFalse();
  });

  it('04 button should be approve and reassign button', async () => {
    component.poSubmitForm.get('approvalUser').patchValue(10);
    spyOn<PoApprovalButtonsComponent, any>(component, 'validateButtons');
    component.onChangeAssignee(component.poSubmitForm.value.approvalUser);
    expect(component.isApproveAndReassign).toBeTruthy();
  });

});
