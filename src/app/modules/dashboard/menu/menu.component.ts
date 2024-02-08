import {Component, HostListener, OnInit} from '@angular/core';
import {AppMainComponent} from '../app.main.component';
import {SideMenuService} from '../../../shared/services/side-menu.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Router} from '@angular/router';
import {NotificationDto} from "../../../shared/dto/dashboard/notification-dto";
import {NotificationEventEmitterService} from "../../../shared/services/common/notification-event-emitter/notification-event-emitter.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  model: any[];
  slimMenu: any[];
  menu: any[];
  unReadEmailCount: any;
  public appConstant = new AppConstant();

  constructor(public app: AppMainComponent, public menuSerivce: SideMenuService, public router: Router
  ,public notificationEventEmitter: NotificationEventEmitterService) {
  }

  ngOnInit() {
    this.setMenuObj();

    // this.menuSerivce.getMenuList().subscribe((res) => {
    //   this.slimMenu = res.body.slimMenu;
    //   this.menu = res.body.menu;
    //   this.setMenuObj();
    // });
    this.getUnreadEmailCount();
  }

  setMenuObj() {
    const menus = JSON.parse(localStorage.getItem(AppConstant.NAV_ITEMS));
    this.slimMenu = menus.slimMenu;
    this.menu = menus.menu;
    if (innerWidth > 991 && this.app.isSlim()) {

      this.model = this.slimMenu;
    } else {
      this.model = this.menu;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setMenuObj();
  }

  onMenuClick(event) {
    this.app.onMenuClick(event);
  }

  /**
   * this method used to get unread email count
   */
  getUnreadEmailCount() {
    this.notificationEventEmitter.notificationsSubscription =
      this.notificationEventEmitter.invokeLoadNotifications.subscribe((notifications) => {
       this.unReadEmailCount = notifications.notReadMail;
      });
  }
}
