import {AfterViewInit, Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCountryPanelOpen]'
})
export class CountryPanelOpenDirective{

  private isOpen = false;
  private selectedOptionIndex = -1;
  private options: any[];

  constructor(private el: ElementRef) { }



  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault(); // Prevent the default Space bar behavior (scrolling the page)
      this.toggleCountryDropdown();
    } else if (event.key === 'Tab') {
      this.isOpen = false;
      this.selectedOptionIndex = -1;
      this.focusInputField();
    } else if (this.isOpen) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent default arrow key behavior
        this.moveSelectedOption(event.key === 'ArrowUp' ? -1 : 1);
      }
    }
  }




  private toggleCountryDropdown() {
    const dropdownToggle = this.el.nativeElement.querySelector('.iti__selected-flag.dropdown-toggle');
    if (dropdownToggle) {
      dropdownToggle.click();
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        // Use a timeout to wait for the dropdown to open and then populate the options
        setTimeout(() => {
          this.populateOptions();
        }, 0);
      }
    }
  }

  private populateOptions() {
    this.options = Array.from(this.el.nativeElement.querySelectorAll('.iti__country'));
    this.selectedOptionIndex = -1;
  }

  private moveSelectedOption(step: number) {
    if (this.options.length === 0) { return; }
    this.selectedOptionIndex += step;
    if (this.selectedOptionIndex < 0) {
      this.selectedOptionIndex = 0;
    } else if (this.selectedOptionIndex >= this.options.length) {
      this.selectedOptionIndex = this.options.length - 1;
    }

    this.focusOption(this.selectedOptionIndex);
  }

  private focusOption(index: number) {
    this.options.forEach((option, i) => {
      if (i === index) {
        option.focus();
        option.classList.add('active'); // Add a class to highlight the selected option
      } else {
        option.classList.remove('active'); // Remove the class from other options
      }
    });
  }

  private focusInputField() {
    const inputElement = this.el.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.focus();
    }
  }

}
