// import {Component, OnInit} from '@angular/core';
// import { AppMainComponent } from './app.main.component';
//
// @Component({
//     selector: 'app-config',
//     template: `
//     <a style="cursor: pointer" id="layout-config-button" class="layout-config-button" (click)="onConfigButtonClick($event)">
//       <i class="pi pi-cog"></i>
//     </a>
//     <div class="layout-config" [ngClass]="{'layout-config-active': app.configActive}" (click)="app.onConfigClick($event)">
//       <h5>Menu Type</h5>
//       <div class="field-radiobutton">
//         <p-radioButton name="menuMode" value="static" [(ngModel)]="app.menuMode" inputId="mode1"></p-radioButton>
//         <label for="mode1">Static</label>
//       </div>
//       <div class="field-radiobutton">
//         <p-radioButton name="menuMode" value="overlay" [(ngModel)]="app.menuMode" inputId="mode2"></p-radioButton>
//         <label for="mode2">Overlay</label>
//       </div>
//       <div class="field-radiobutton">
//         <p-radioButton name="menuMode" value="slim" [(ngModel)]="app.menuMode" inputId="mode3"></p-radioButton>
//         <label for="mode3">Slim</label>
//       </div>
//
//       <hr/>
//
// <!--      <h5>Color Scheme</h5>-->
// <!--      <div class="field-radiobutton">-->
// <!--        <p-radioButton name="colorScheme" value="dark" [(ngModel)]="app.colorScheme" inputId="theme1" (onClick)="changeColorScheme('dark')"></p-radioButton>-->
// <!--        <label for="theme1">Dark</label>-->
// <!--      </div>-->
// <!--      <div class="field-radiobutton">-->
// <!--        <p-radioButton name="colorScheme" value="dim" [(ngModel)]="app.colorScheme" inputId="theme2" (onClick)="changeColorScheme('dim')"></p-radioButton>-->
// <!--        <label for="theme2">Dim</label>-->
// <!--      </div>-->
// <!--      <div class="field-radiobutton">-->
// <!--        <p-radioButton name="colorScheme" value="light" [(ngModel)]="app.colorScheme" inputId="theme3" (onClick)="changeColorScheme('light')"></p-radioButton>-->
// <!--        <label for="theme3">Light</label>-->
// <!--      </div>-->
//
// <!--      <hr />-->
//
//
//       <h5>Menu Themes</h5>
//       <div class="layout-themes" *ngIf="app.colorScheme === 'light'">
//         <div *ngFor="let theme of menuThemes">
//           <a style="cursor: pointer" (click)="changeMenuTheme(theme.name, theme.logoColor, theme.componentTheme)" [ngStyle]="{'background-color': theme.color}"></a>
//         </div>
//       </div>
//       <div *ngIf="app.colorScheme !== 'light'">
//         <p>Menu themes are only available in light mode by design as large surfaces can emit too much brightness in dark mode.</p>
//       </div>
//
//       <hr />
//     </div>
//   `
// })
// export class AppConfigComponent implements OnInit {
//
//   menuThemes: any[];
//
//   componentThemes: any[];
//
//   componentTheme = 'blue';
//
//   constructor(public app: AppMainComponent) {}
//
//   ngOnInit() {
//     this.componentThemes = [
//       {name: 'blue', color: '#42A5F5'},
//       {name: 'green', color: '#66BB6A'},
//       {name: 'lightgreen', color: '#9CCC65'},
//       {name: 'purple', color: '#AB47BC'},
//       {name: 'deeppurple', color: '#7E57C2'},
//       {name: 'indigo', color: '#5C6BC0'},
//       {name: 'orange', color: '#FFA726'},
//       {name: 'cyan', color: '#26C6DA'},
//       {name: 'pink', color: '#EC407A'},
//       {name: 'teal', color: '#26A69A'}
//     ];
//
//     this.menuThemes = [
//       {name: 'white', color: '#ffffff', logoColor: 'dark', componentTheme: null},
//       {name: 'darkgray', color: '#343a40', logoColor: 'white', componentTheme: null},
//       {name: 'blue', color: '#1976d2', logoColor: 'white', componentTheme: 'blue'},
//       {name: 'bluegray', color: '#455a64', logoColor: 'white', componentTheme: 'lightgreen'},
//       {name: 'brown', color: '#5d4037', logoColor: 'white', componentTheme: 'cyan'},
//       {name: 'cyan', color: '#0097a7', logoColor: 'white', componentTheme: 'cyan'},
//       {name: 'green', color: '#388e3C', logoColor: 'white', componentTheme: 'green'},
//       {name: 'indigo', color: '#303f9f', logoColor: 'white', componentTheme: 'indigo'},
//       {name: 'deeppurple', color: '#512da8', logoColor: 'white', componentTheme: 'deeppurple'},
//       {name: 'orange', color: '#F57c00', logoColor: 'dark', componentTheme: 'orange'},
//       {name: 'pink', color: '#c2185b', logoColor: 'white', componentTheme: 'pink'},
//       {name: 'purple', color: '#7b1fa2', logoColor: 'white', componentTheme: 'purple'},
//       {name: 'teal', color: '#00796b', logoColor: 'white', componentTheme: 'teal'},
//     ];
//   }
//
//   changeColorScheme(scheme) {
//     this.changeStyleSheetsColor('layout-css', 'layout-' + scheme + '.css', 1);
//     this.changeStyleSheetsColor('theme-css', 'theme-' + scheme + '.css', 1);
//
//     const mobileLogoLink: HTMLImageElement = document.getElementById('logo-mobile') as HTMLImageElement;
//     const invoiceLogoLink: HTMLImageElement = document.getElementById('invoice-logo') as HTMLImageElement;
//     const footerLogoLink: HTMLImageElement = document.getElementById('footer-logo') as HTMLImageElement;
//
//     if (scheme === 'light') {
//       mobileLogoLink.src = 'assets/layout/images/logo-dark.svg';
//       invoiceLogoLink.src = 'assets/layout/images/logo-dark.svg';
//       footerLogoLink.src = 'assets/layout/images/logo-dark.svg';
//     }
//     else {
//       mobileLogoLink.src = 'assets/layout/images/logo-white.svg';
//       invoiceLogoLink.src = 'assets/layout/images/logo-white.svg';
//       footerLogoLink.src = 'assets/layout/images/logo-white.svg';
//     }
//   }
//
//   changeMenuTheme(name, logoColor, componentTheme) {
//     this.app.menuTheme = 'layout-sidebar-' + name;
//     this.changeStyleSheetsColor('theme-css', componentTheme, 2);
//
//     const appLogoLink: HTMLImageElement = document.getElementById('app-logo') as HTMLImageElement;
//
//     if (logoColor === 'dark') {
//       appLogoLink.src = 'assets/layout/images/logo-dark.svg';
//     }
//     else {
//       appLogoLink.src = 'assets/layout/images/logo-white.svg';
//     }
//   }
//
//   changeComponentTheme(theme) {
//     this.changeStyleSheetsColor('theme-css', theme, 3);
//   }
//
//   changeStyleSheetsColor(id, value, from) {
//     const element = document.getElementById(id);
//     const urlTokens = element.getAttribute('href').split('/');
//
//     if (from === 1) {           // which function invoked this function
//       urlTokens[urlTokens.length - 1] = value;
//     }
//     else if (from === 2) {       // which function invoked this function
//       if (value !== null) {
//         urlTokens[urlTokens.length - 2] = value;
//       }
//     }
//     else if (from === 3) {       // which function invoked this function
//       urlTokens[urlTokens.length - 2] = value;
//     }
//
//     const newURL = urlTokens.join('/');
//
//     this.replaceLink(element, newURL);
//   }
//
//   replaceLink(linkElement, href) {
//     if (this.isIE()) {
//       linkElement.setAttribute('href', href);
//     }
//     else {
//       const id = linkElement.getAttribute('id');
//       const cloneLinkElement = linkElement.cloneNode(true);
//
//       cloneLinkElement.setAttribute('href', href);
//       cloneLinkElement.setAttribute('id', id + '-clone');
//
//       linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
//
//       cloneLinkElement.addEventListener('load', () => {
//         linkElement.remove();
//         cloneLinkElement.setAttribute('id', id);
//       });
//     }
//   }
//
//   isIE() {
//     return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
//   }
//
//   onConfigButtonClick(event) {
//     this.app.configActive = !this.app.configActive;
//     this.app.configClick = true;
//     event.preventDefault();
//   }
//
//   onConfigCloseClick(event) {
//     this.app.configActive = false;
//     event.preventDefault();
//   }
// }
