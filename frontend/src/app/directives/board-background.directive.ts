import { Directive, ElementRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Coord } from '../models/coord';

@Directive({
  selector: '[appBoardBackground]'
})
export class BoardBackgroundDirective {

  constructor(public el: ElementRef) {
     }

     @Input() set appBoardBackground(coordinates: Coord[]) {
      if (coordinates) {
        console.log(this.el);        
        let ctx:any = this.el.nativeElement.getContext("2d");
        ctx.strokeStyle = "#000000"; // color of grid lines
        ctx.beginPath();
        const baseOffset:number = 23;
        const part:number = 100;

        this.drawSqure(ctx, baseOffset, part * 6);
        this.drawSqure(ctx, baseOffset + part, part * 4);
        this.drawSqure(ctx, baseOffset + part *2, part * 2);

        ctx.moveTo(baseOffset + part * 3, baseOffset);
        ctx.lineTo(baseOffset + part * 3, baseOffset + part * 2);
        
        ctx.moveTo(baseOffset + part * 3 * 2, baseOffset + part * 3);
        ctx.lineTo(baseOffset + part * 4, baseOffset + part * 3);
        
        ctx.moveTo(baseOffset + part * 3, baseOffset + part * 3 * 2);
        ctx.lineTo(baseOffset + part * 3, baseOffset + part * 4);
        
        ctx.moveTo(baseOffset, baseOffset + part * 3);
        ctx.lineTo(baseOffset + part * 2, baseOffset + part * 3);

        ctx.stroke();
      } 
    }
    private drawSqure(ctx:any, offset:number, w:number)
    {      
      ctx.moveTo(offset, offset);
      ctx.moveTo(offset, offset);
      ctx.lineTo(w + offset, offset);
      ctx.lineTo(w + offset, w + offset);
      ctx.lineTo(offset, w + offset);
      ctx.lineTo(offset, offset);
    }
}
