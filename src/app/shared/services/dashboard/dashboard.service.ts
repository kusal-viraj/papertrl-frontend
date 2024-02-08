import {Injectable} from '@angular/core';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ExpenseTableDto} from '../../dto/expense/expense-table-dto';
import {TaskListDto} from '../../dto/dashboard/task-list-dto';
import {InfoCardsDto} from '../../dto/dashboard/info-cards-dto';
import {ChartDto} from '../../dto/dashboard/chart-dto';
import {NotificationDto} from '../../dto/dashboard/notification-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {DropdownDto} from "../../dto/common/dropDown/dropdown-dto";
import {CommonUtility} from "../../utility/common-utility";
import {map} from "rxjs/operators";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public commonUtil = new CommonUtility();

  constructor(public httpClient: HttpClient) {
  }
  public supportDialogRef: DynamicDialogRef;
  public supportTableList = new BehaviorSubject(null);

  /**
   * Convert objects into forms
   */
  getFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  /**
   * Get Approval table Data
   */
  getApprovalTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/dashboard-approval-column-data.json', {observe: 'response'});
  }

  /**
   * Get Approval data list
   */
  getApprovalTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.get<ExpenseTableDto[]>('assets/demo/data/tables/dashboard-approval-master-data.json', {observe: 'response'});
  }

  /**
   * Get Approval table Data
   */
  getDiscountTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/dashboard-discount-column-data.json', {observe: 'response'});
  }

  /**
   * Get Approval data list
   */
  getDiscountTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_discount_applicable_bills', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * Mark task as done
   * @param id id
   */
  taskDone(id) {
    return this.httpClient.post('', {}, {params: id, observe: 'response'});
  }

  /**
   * get info card details
   */
  getInfoCards() {
    return this.httpClient.get<InfoCardsDto>('../assets/demo/data/dashboard-small-cards.json', {observe: 'response'});
  }

  /**
   * get Linear chart data
   */
  getLineChartData() {
    return this.httpClient.get<ChartDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_chart_info', {observe: 'response'});
  }

  /**
   * Get Bar chart data
   */
  getBarData() {
    return this.httpClient.get<ChartDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bar_chart_info', {observe: 'response'});
  }

  /**
   * Get Notifications chart data
   */
  getNotifications() {
    return this.httpClient.get<NotificationDto[]>('../assets/demo/data/dashboard-notifications-data.json', {observe: 'response'});
  }

  /**
   * Delete Notification
   */
  deleteNotifications(tenantId, notificationId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/message_service/sec_mark_notification_as_closed', {},
      {
        params: {tenantId, notificationId},
        observe: 'response'
      });
  }

  /**
   * Mark as read Notification
   */
  markAsReadNotifications(tenantId, notificationId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/message_service/sec_mark_notification_as_read', {},
      {
        params: {tenantId, notificationId},
        observe: 'response'
      });
  }

  getUserNotificationList(tenantId, userId){
    return this.httpClient.get(ApiEndPoint.API_URL + '/message_service/sec_get_available_notifications',
      {params: {tenantId, userId}, observe: 'response'});
  }

  /**
   * Clear all Notification
   */
  clearAllNotifications(tenantId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/message_service/sec_mark_all_notification_as_closed', {},
      {
        params: {tenantId},
        observe: 'response'
      });
  }

  getVendorPortalCustomers(query) {
    return this.httpClient.get<any>('../assets/demo/data/vendor-portal-customers.json', {
      params: {letter: query},
      observe: 'response'
    });
  }

  /**
   * Get to do List
   */
  getToDoList() {
    return this.httpClient.get<TaskListDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_system_task_list', {observe: 'response'});
  }

  /**
   * Get card list
   */
  getCardList() {
    return this.httpClient.get<TaskListDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_load_small_card_v2', {observe: 'response'});
  }

  /**
   * Get to do List
   */
  markAsDone(id) {
    return this.httpClient.put<TaskListDto[]>(ApiEndPoint.API_URL + '/common_service/sec_change_common_system_task_status', {}, {
      observe: 'response',
      params: {taskId: id}
    });
  }

  getBillTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/get_discount_applicable_list', searchFilterDto,
      {observe: 'response'});
  }

  getNotificationsTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.get<TableColumnsDto>(ApiEndPoint.API_URL + '/common_service/sec_get_notification_subscription_list_v2',
      {observe: 'response'});
  }

  notificationSubscriptionChanged(notificationUserWise) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_create_user_wise_notification_subscription_v2',
      notificationUserWise, {observe: 'response'});
  }

  getRolePrivileges() {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/role_management/sec_get_portal_role_wise_authority_list_v2', {observe: 'response'}).toPromise();
  }

  getNavList() {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_user_nav_list', {observe: 'response'});
  }


  /////////////////////////////////////////////// Support Ticket ////////////////////////////////////////////////////

  getFeatureList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_support_feature_list_v2',
      {observe: 'response'});
  }

  createTicket(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_support_ticket_v2',
      this.getFormData(value), {observe: 'response', withCredentials: true});
  }

  addComment(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_support_ticket_add_comment_attachment_v2',
      value, {observe: 'response', withCredentials: true});
  }

  updateTicket(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_save_credit_card_for_employee',
      value, {observe: 'response', withCredentials: true});
  }

  getCategoryList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_support_ticket_types_v2',
      {observe: 'response'});
  }

  getTicketGridData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_search_support_ticket_v2', searchFilterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  downloadTicketAttachment(ticketId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/common_service/sec_download_support_ticket_attachment_v2',{},
        {
          params: {ticketId},
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  getTicketTimeLine(ticketId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_support_ticket_comments_v2',
      {observe: 'response', params:{ticketId}});
  }
}
