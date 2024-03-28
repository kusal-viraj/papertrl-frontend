import { Component, OnInit } from '@angular/core';
import {AppTabKey} from "../../../shared/enums/app-tab-key";
import {AppMainComponent, MenuTypes} from "../app.main.component";

@Component({
  selector: 'app-personalize',
  templateUrl: './personalize.component.html',
  styleUrls: ['./personalize.component.scss']
})
export class PersonalizeComponent implements OnInit {

  public menuThemes: any[];
  constructor(public app: AppMainComponent) { }

  ngOnInit(): void {
    this.menuThemes = [
      {name: 'white', color: '#ffffff', logoColor: 'dark', componentTheme: null},
      {name: 'darkgray', color: '#343a40', logoColor: 'white', componentTheme: null},
      {name: 'blue', color: '#1976d2', logoColor: 'white', componentTheme: 'blue'},
      {name: 'bluegray', color: '#455a64', logoColor: 'white', componentTheme: 'lightgreen'},
      {name: 'brown', color: '#5d4037', logoColor: 'white', componentTheme: 'cyan'},
      {name: 'cyan', color: '#0097a7', logoColor: 'white', componentTheme: 'cyan'},
      {name: 'green', color: '#388e3C', logoColor: 'white', componentTheme: 'green'},
      {name: 'indigo', color: '#303f9f', logoColor: 'white', componentTheme: 'indigo'},
      {name: 'deeppurple', color: '#512da8', logoColor: 'white', componentTheme: 'deeppurple'},
      {name: 'orange', color: '#F57c00', logoColor: 'dark', componentTheme: 'orange'},
      {name: 'pink', color: '#c2185b', logoColor: 'white', componentTheme: 'pink'},
      {name: 'purple', color: '#7b1fa2', logoColor: 'white', componentTheme: 'purple'},
      {name: 'teal', color: '#00796b', logoColor: 'white', componentTheme: 'teal'},
    ];
  }
  /**
   * Change Menu colour
   */
  changeMenuTheme(name) {
    this.app.menuTheme = 'layout-sidebar-' + name;
    this.saveMenuState();
  }

  /**
   * Change Menu Type
   */
  changeMenuMode() {
    this.saveMenuState();
  }

  /**
   * Reset Theme to default
   */
  resetTheme() {
    this.app.menuTheme = 'layout-sidebar-bluegray';
    this.app.menuMode = 'slim';
    this.saveMenuState();
  }

  /**
   * Save Menu states to local Storage
   */
  saveMenuState() {
    if (localStorage.getItem(AppTabKey.MENU_STATE_KEY)) {
      const menus: MenuTypes = JSON.parse(localStorage.getItem(AppTabKey.MENU_STATE_KEY));
      menus.menuMode = this.app.menuMode;
      menus.menuTheme = this.app.menuTheme;
      localStorage.setItem(AppTabKey.MENU_STATE_KEY, JSON.stringify(menus));
      window.dispatchEvent(new Event('resize'));
    } else {
      const menus: MenuTypes = new MenuTypes();
      menus.menuMode = this.app.menuMode;
      menus.menuTheme = this.app.menuTheme;
      localStorage.setItem(AppTabKey.MENU_STATE_KEY, JSON.stringify(menus));
      window.dispatchEvent(new Event('resize'));
    }
  }

}
