import {Directive, ElementRef, HostBinding, HostListener, Renderer2, ViewChild} from '@angular/core';
import {MultiSelect} from "primeng/multiselect";

@Directive({
  selector: '[appMultiselectFocus]'
})
export class MultiselectFocusDirective{
  constructor(private el: ElementRef, private renderer: Renderer2, private multiSelect: MultiSelect) {}

  @HostBinding('attr.data-multiselect-id')
  multiselectId: string;
  private isPanelOpen = false;

  @HostListener('keydown.space', ['$event'])
  onSpacebarKeyDown(event: KeyboardEvent) {
    // Prevent the space bar from triggering other events on the page.
    event.preventDefault();

    // Toggle the panel visibility when the space bar is pressed.
    this.isPanelOpen = !this.isPanelOpen;
    const multiselectElement = this.el.nativeElement.querySelector('.p-multiselect-panel');
    if (this.isPanelOpen) {
      multiselectElement.style.display = 'block';
      // Add the custom class to highlight the p-multiselect element when the panel is open.
      this.renderer.addClass(this.el.nativeElement, 'custom-focus-class');

      // Focus on the search filter input field when opening the panel.
      const searchInput = multiselectElement.querySelector('.p-multiselect-filter');
      if (searchInput) {
        searchInput.focus();
      }
    } else {
      multiselectElement.style.display = 'none';
      // Remove the custom class when closing the panel.
      this.renderer.removeClass(this.el.nativeElement, 'custom-focus-class');

      // Trigger a click event on the multiselect element to ensure it receives focus.
      const multiselectButton = this.el.nativeElement.querySelector('.p-multiselect-trigger');
      if (multiselectButton) {
        multiselectButton.click();
      }
    }

    // Find the next focusable element and focus on it.
    const nextFocusable = this.el.nativeElement.nextElementSibling;
    if (nextFocusable) {
      nextFocusable.focus();
    }
  }

  // Prevent default enter key behaviour
  @HostListener('keydown.enter', ['$event'])
  keydownEnter(event: KeyboardEvent){
    event.preventDefault();
  }

  @HostListener('keydown.enter', ['$event'])
  openMultiSelect(event: any) {
    event.preventDefault();
    this.multiSelect.show();
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    // Remove the custom class and close the panel when the p-multiselect element loses focus.
    this.renderer.removeClass(this.el.nativeElement, 'custom-focus-class');
    this.el.nativeElement.querySelector('.p-multiselect-panel').style.display = 'none';
    this.isPanelOpen = false;
  }

  /**
   * This method used to stop the automatically closing multiselect dropdown when deselect the options
   */

  @HostListener('onChange', ['$event'])
  noCloseMultiselect(event: any) {
    event.originalEvent.stopPropagation();
  }
}
