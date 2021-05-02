import { Component, Input, OnInit } from '@angular/core';
import { COLOR } from 'src/app/enums/color.enum';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.less']
})
export class PieceComponent implements OnInit {

  @Input() color: COLOR = COLOR.UNDEFINED;
  @Input() selected: boolean = false;
  @Input() selectable: boolean = false;
  @Input() removing: boolean = false;
  _COLOR: typeof COLOR = COLOR;

  constructor() { }

  ngOnInit(): void {
  }

}
