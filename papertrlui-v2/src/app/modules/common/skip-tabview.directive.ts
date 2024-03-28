import {AfterViewInit, Directive, ElementRef, Renderer2} from '@angular/core';

@Directive({
  selector: '[appSkipTabview]'
})
export class SkipTabviewDirective implements AfterViewInit{

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit() {
    const tabViewNavItems = this.el.nativeElement.querySelectorAll('.p-tabview .p-tabview-nav li .p-tabview-nav-link');
    if (tabViewNavItems) {
      tabViewNavItems.forEach(tab => {
        this.renderer.setAttribute(tab, 'tabindex', '-1');
      });
    }
  }

}
