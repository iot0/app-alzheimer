import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { DomController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class DrawerComponent {

  @Input('options') options: any;

  @Output("change") onChange: EventEmitter<any> = new EventEmitter<any>();

  handleHeight: number = 50;
  bounceBack: boolean = true;
  thresholdTop: number = 200;
  thresholdBottom: number = 200;

  OPEN_STATE = 'opened';
  CLOSE_STATE = 'closed';
  CURRENT_STATE = this.CLOSE_STATE;

  constructor(public element: ElementRef, public renderer: Renderer2, public domCtrl: DomController, public platform: Platform) {

  }

  ngAfterViewInit() {

    if (this.options.handleHeight) {
      this.handleHeight = this.options.handleHeight;
    }

    if (this.options.bounceBack) {
      this.bounceBack = this.options.bounceBack;
    }

    if (this.options.thresholdFromBottom) {
      this.thresholdBottom = this.options.thresholdFromBottom;
    }

    if (this.options.thresholdFromTop) {
      this.thresholdTop = this.options.thresholdFromTop;
    }

    this.renderer.setStyle(this.element.nativeElement, 'top', this.platform.height() - this.handleHeight + 'px');

    let hammer = new window['Hammer'](this.element.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_VERTICAL });

    hammer.on('pan', (ev) => {
      this.handlePan(ev);
    });

  }

  handlePan(ev) {

    let newTop = ev.center.y;

    let bounceToBottom = false;
    let bounceToTop = false;

    if (this.bounceBack && ev.isFinal) {

      let topDiff = newTop - this.thresholdTop;
      let bottomDiff = (this.platform.height() - this.thresholdBottom) - newTop;

      topDiff >= bottomDiff ? bounceToBottom = true : bounceToTop = true;

    }

    if ((newTop < this.thresholdTop && ev.additionalEvent === "panup") || bounceToTop) {

      this.openDrawer();

    } else if (((this.platform.height() - newTop) < this.thresholdBottom && ev.additionalEvent === "pandown") || bounceToBottom) {

      this.closeDrawer();

    } else {

      this.renderer.setStyle(this.element.nativeElement, 'transition', 'none');

      if (newTop > 0 && newTop < (this.platform.height() - this.handleHeight)) {

        if (ev.additionalEvent === "panup" || ev.additionalEvent === "pandown") {

          this.domCtrl.write(() => {
            this.renderer.setStyle(this.element.nativeElement, 'top', newTop + 'px');
          });

        }

      }

    }

  }

  //TODO:To close/open 
  toggleState() {
    switch (this.CURRENT_STATE) {
      case this.OPEN_STATE:
        this.closeDrawer();
        break;
      case this.CLOSE_STATE:
        this.openDrawer();
        break;
    }
  }

  //TODO:To open drawer
  openDrawer() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'transition', 'top 0.5s');
      this.renderer.setStyle(this.element.nativeElement, 'top', '0px');
    });

    //emit event to let the host know it is opened
    this.onChange.emit(this.OPEN_STATE);

    //chnage state
    this.CURRENT_STATE = this.OPEN_STATE;
  }

  //TODO:To close drawer
  closeDrawer() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'transition', 'top 0.5s');
      this.renderer.setStyle(this.element.nativeElement, 'top', this.platform.height() - this.handleHeight + 'px');
    });

    //emit event to let the host know it is opened
    this.onChange.emit(this.CLOSE_STATE);
    //chnage state
    this.CURRENT_STATE = this.CLOSE_STATE;
  }

}
