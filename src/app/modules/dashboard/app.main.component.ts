import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {MenuService} from '../../shared/services/menu.service';
import {ActivatedRoute, NavigationEnd, Router, RouterState} from '@angular/router';
import {AppTabKey} from '../../shared/enums/app-tab-key';
import {Title} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {Gtag} from "angular-gtag";
import {CommonUtility} from "../../shared/utility/common-utility";

export class MenuTypes {
  public menuTheme?: any;
  public menuMode?: any;
}


@Component({
  selector: 'app-main',
  templateUrl: './app.main.component.html',
})

export class AppMainComponent implements OnInit {
  menuMode = 'slim';

  colorScheme = 'dark';
  menus: MenuTypes = new MenuTypes();

  menuTheme = 'layout-sidebar-bluegray';

  overlayMenuActive: boolean;

  staticMenuDesktopInactive: boolean;

  staticMenuMobileActive: boolean;

  menuClick: boolean;

  search = false;

  searchClick = false;

  userMenuClick: boolean;

  topbarUserMenuActive: boolean;

  notificationMenuClick: boolean;

  topbarNotificationMenuActive: boolean;

  rightMenuClick: boolean;

  rightMenuActive: boolean;

  configActive: boolean;

  configClick: boolean;

  resetMenu: boolean;

  menuHoverActive = false;

  inputStyle = 'outlined';

  ripple: boolean;

  constructor(private menuService: MenuService, private primengConfig: PrimeNGConfig, public router: Router,
              private titleService: Title, @Inject(DOCUMENT) private document: Document) {
    new CommonUtility().updateGAnalytics(router, titleService, this.document);
  }

  ngOnInit() {
    this.ripple = true;
    this.primengConfig.ripple = true;
    if (localStorage.getItem(AppTabKey.MENU_STATE_KEY)) {
      const menus: MenuTypes = JSON.parse(localStorage.getItem(AppTabKey.MENU_STATE_KEY));
      this.changeTheme(menus.menuMode, 'light');
      this.menuTheme = menus.menuTheme;
    } else {
      this.changeTheme('slim', 'light');
    }
  }

  changeTheme(menu, theme) {
    this.menuMode = menu;
    this.colorScheme = theme;
    // this.changeColorScheme(theme);
  }

  // changeColorScheme(scheme) {
  //   localStorage.setItem('theme', scheme);
  //   this.changeStyleSheetsColor('layout-css', 'layout-' + scheme + '.css', 1);
  //   this.changeStyleSheetsColor('theme-css', 'theme-' + scheme + '.css', 1);
  //
  //   const mobileLogoLink: HTMLImageElement = document.getElementById('logo-mobile') as HTMLImageElement;
  //   const invoiceLogoLink: HTMLImageElement = document.getElementById('invoice-logo') as HTMLImageElement;
  //   const footerLogoLink: HTMLImageElement = document.getElementById('footer-logo') as HTMLImageElement;
  //
  //   if (scheme === 'light') {
  //     // mobileLogoLink.src = 'assets/layout/images/logo-dark.svg';
  //     // invoiceLogoLink.src = 'assets/layout/images/logo-dark.svg';
  //     // footerLogoLink.src = 'assets/layout/images/logo-dark.svg';
  //   } else {
  //     // mobileLogoLink.src = 'assets/layout/images/logo-white.svg';
  //     // invoiceLogoLink.src = 'assets/layout/images/logo-white.svg';
  //     // footerLogoLink.src = 'assets/layout/images/logo-white.svg';
  //   }
  // }

  // changeStyleSheetsColor(id, value, from) {
  //   const element = document.getElementById(id);
  //   const urlTokens = element.getAttribute('href').split('/');
  //
  //   if (from === 1) {           // which function invoked this function
  //     urlTokens[urlTokens.length - 1] = value;
  //   } else if (from === 2) {       // which function invoked this function
  //     if (value !== null) {
  //       urlTokens[urlTokens.length - 2] = value;
  //     }
  //   } else if (from === 3) {       // which function invoked this function
  //     urlTokens[urlTokens.length - 2] = value;
  //   }
  //
  //   const newURL = urlTokens.join('/');
  //
  //   this.replaceLink(element, newURL);
  // }

  // replaceLink(linkElement, href) {
  //   if (this.isIE()) {
  //     linkElement.setAttribute('href', href);
  //   } else {
  //     const id = linkElement.getAttribute('id');
  //     const cloneLinkElement = linkElement.cloneNode(true);
  //
  //     cloneLinkElement.setAttribute('href', href);
  //     cloneLinkElement.setAttribute('id', id + '-clone');
  //
  //     linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
  //
  //     cloneLinkElement.addEventListener('load', () => {
  //       linkElement.remove();
  //       cloneLinkElement.setAttribute('id', id);
  //     });
  //   }
  // }

  // isIE() {
  //   return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
  // }
  onLayoutClick() {
    if (!this.searchClick) {
      this.search = false;
    }

    if (!this.userMenuClick) {
      this.topbarUserMenuActive = false;
    }

    if (!this.notificationMenuClick) {
      this.topbarNotificationMenuActive = false;
    }

    if (!this.rightMenuClick) {
      this.rightMenuActive = false;
    }

    if (!this.menuClick) {
      if (this.isSlim()) {
        this.menuService.reset();
      }

      if (this.overlayMenuActive || this.staticMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
      this.unblockBodyScroll();
    }

    if (this.configActive && !this.configClick) {
      this.configActive = false;
    }

    this.searchClick = false;
    this.configClick = false;
    this.userMenuClick = false;
    this.rightMenuClick = false;
    this.notificationMenuClick = false;
    this.menuClick = false;
  }

  onMenuButtonClick(event) {
    this.menuClick = true;
    this.topbarUserMenuActive = false;
    this.topbarNotificationMenuActive = false;
    this.rightMenuActive = false;

    if (this.isOverlay()) {
      this.overlayMenuActive = !this.overlayMenuActive;
    }

    if (this.isDesktop()) {
      this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
    } else {
      this.staticMenuMobileActive = !this.staticMenuMobileActive;
      if (this.staticMenuMobileActive) {
        this.blockBodyScroll();
      } else {
        this.unblockBodyScroll();
      }
    }

    event.preventDefault();
  }

  onSearchClick(event) {
    this.search = !this.search;
    this.searchClick = !this.searchClick;
  }

  onMenuClick($event) {
    this.menuClick = true;
    this.resetMenu = false;
  }

  onTopbarUserMenuButtonClick(event) {
    this.userMenuClick = true;
    this.topbarUserMenuActive = !this.topbarUserMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onTopbarNotificationMenuButtonClick(event) {
    this.notificationMenuClick = true;
    this.topbarNotificationMenuActive = !this.topbarNotificationMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onRightMenuClick(event) {
    this.rightMenuClick = true;
    this.rightMenuActive = !this.rightMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onRippleChange(event) {
    // this.ripple = event.checked;
  }

  onConfigClick(event) {
    this.configClick = true;
    window.dispatchEvent(new Event('resize'));
  }

  isSlim() {
    return this.menuMode === 'slim';
  }

  isOverlay() {
    return this.menuMode === 'overlay';
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return window.innerWidth <= 991;
  }

  hideOverlayMenu() {
    this.overlayMenuActive = false;
    this.staticMenuMobileActive = false;
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
        'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }
}
