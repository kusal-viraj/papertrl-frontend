import {AfterViewInit, Directive, ElementRef, HostListener, Renderer2} from '@angular/core';
import {Calendar} from "primeng/calendar";

@Directive({
  selector: '[appTabindexMinusOne]'
})
export class TabindexMinusOneDirective implements AfterViewInit{

  constructor(private el: ElementRef, private renderer: Renderer2, private calendar: Calendar) {}

  ngAfterViewInit() {
    const calendarIcon = this.el.nativeElement.querySelector('.p-calendar-w-btn .p-datepicker-trigger');

    if (calendarIcon) {
      this.renderer.setAttribute(calendarIcon, 'tabindex', '-1');
    }
  }

  @HostListener('keydown.enter', ['$event'])
  isPressEnter() {
    const calendarInputField = this.el.nativeElement.querySelector('.p-fluid .p-calendar .p-inputtext');
    calendarInputField.focus();
  }

  @HostListener('click', ['$event'])
  isClickEvent(event: MouseEvent) {
    const calendarInputField = this.el.nativeElement.querySelector('.p-fluid .p-calendar .p-inputtext');
    calendarInputField.focus();
  }

  @HostListener('onSelect', ['$event'])
  openCalendar(event: any) {
    const calendarInputElement = this.el.nativeElement.querySelector('.p-calendar input');
    if (calendarInputElement) {
      this.renderer.selectRootElement(calendarInputElement).focus();
    }
  }


}
