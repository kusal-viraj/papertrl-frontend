import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appNoNegativeValues]'
})
export class NoNegativeValuesDirective {

  constructor(private elementRef: ElementRef) { }


  @HostListener('keydown', ['$event'])
  onInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'Minus') {
      // Prevent the default behavior (input of the minus key)
      event.preventDefault();
    }
  }

}
