import {Injectable, ViewContainerRef} from '@angular/core';
import {BillApproveMainComponent} from "../../modules/bills/bill-approve-main/bill-approve-main.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectDetailViewComponent} from "../../modules/project-code/project-detail-view/project-detail-view.component";
import {PrivilegeService} from "../services/privilege.service";
import {CreditNoteDetailViewComponent} from "../../modules/bills/credit-note/credit-note-detail-view/credit-note-detail-view.component";
import {VendorDetailViewComponent} from "../../modules/vendor/vendor-detail-view/vendor-detail-view.component";
import {ExpenseDetailViewComponent} from '../../modules/expense/expense-detail-view/expense-detail-view.component';
import {VCardEditComponent} from "../../modules/common/v-card-edit/v-card-edit.component";
import {BehaviorSubject} from "rxjs";
import {PoDetailViewComponent} from "../../modules/purchase-order/po-detail-view/po-detail-view.component";
import {AccountDetailViewComponent} from "../../modules/account/account-detail-view/account-detail-view.component";

@Injectable({
  providedIn: 'root'
})
export class DetailViewService {

  private billRef: DynamicDialogRef = new DynamicDialogRef();
  private prjRef: DynamicDialogRef = new DynamicDialogRef();
  private creditNoteRef: DynamicDialogRef = new DynamicDialogRef();
  private vendorRef: DynamicDialogRef = new DynamicDialogRef();
  private expenseRef: DynamicDialogRef = new DynamicDialogRef();
  private accountRef: DynamicDialogRef = new DynamicDialogRef();
  private poRef: DynamicDialogRef = new DynamicDialogRef();
  public _cardsState = new BehaviorSubject<{id: number | null, detailView: boolean}>({id: null, detailView: false});

  constructor(public dialogService: DialogService, public privilegeService: PrivilegeService) {
  }


  openBillDetailView(id) {
    this.billRef = this.dialogService.open(BillApproveMainComponent, {
      width: '100%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      styleClass: 'detail-view-drawer-full-screen',
      closable: false,
      data: {id}
    });
  }

  closeBillDetailView() {
    if (this.billRef){
      this.billRef.close();
    }
  }


  openProjectCodeDetailView(id) {
    this.prjRef = this.dialogService.open(ProjectDetailViewComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '60%',
      contentStyle: {overflow: 'auto'},
      autoZIndex: true,
      closable: false,
      data: {id},
    });
  }

  closePrjDetailView() {
    if (this.prjRef){
      this.prjRef.close();
    }
  }

  openCreditNoteDetailView(id) {
    this.creditNoteRef = this.dialogService.open(CreditNoteDetailViewComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '60%',
      contentStyle: {overflow: 'auto'},
      autoZIndex: true,
      closable: false,
      data: {id}
    });
  }

  closeCreditNoteDetailView() {
    if (this.creditNoteRef){
      this.creditNoteRef.close();
    }
  }

  openVendorDetailView(id) {
    this.vendorRef = this.dialogService.open(VendorDetailViewComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '80%',
      contentStyle: {overflow: 'auto'},
      styleClass: 'detail-view-drawer-full-screen',
      autoZIndex: true,
      closable: true,
      data: {id},
      header: 'Vendor Details'
    });
  }

  closeVendorDetailView() {
    if (this.vendorRef){
      this.vendorRef.close();
    }
  }

  openPODetailView(id){
    this.poRef = this.dialogService.open(PoDetailViewComponent, {
      width: '100%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      styleClass: 'detail-view-drawer-full-screen',
      closable: false,
      data: {id}
    });
  }


  closePoDetailView() {
    if (this.poRef){
      this.poRef.close();
    }
  }

  openExpenseDetailView(id) {
    this.expenseRef = this.dialogService.open(ExpenseDetailViewComponent, {
      width: '100%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      styleClass: 'detail-view-drawer-full-screen',
      closable: false,
      data: {id}
    });
  }

  closeExpenseDetailView() {
    if (this.expenseRef){
      this.expenseRef.close();
    }
  }

  openAccountsDetailView(id) {
    this.accountRef = this.dialogService.open(AccountDetailViewComponent, {
      width: this.privilegeService.isMobile() ? '100%' : '40%',
      contentStyle: {overflow: 'auto'},
      autoZIndex: true,
      closable: false,
      data: {id},
    });
  }

  closeAccountsDetailView() {
    if (this.accountRef){
      this.accountRef.close();
    }
  }

  openCardsDetailView(id) {
    this._cardsState.next({id, detailView: true});
  }
}
