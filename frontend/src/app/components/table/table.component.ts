import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { COLOR } from 'src/app/enums/color.enum';
import { Coord } from 'src/app/models/coord';
import { Game } from 'src/app/models/game';
import { IGame } from 'src/app/models/interfaces/igame';
import { BlockchainService } from 'src/app/services/blockchain.service';
import { GameHelper } from 'src/app/utils/game-helper';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})
export class TableComponent implements OnInit {
  positions: COLOR[] = [];
  _COLOR: typeof COLOR = COLOR;
  fromIndexIndex: number = -1;
  removeIndex: number = -1;
  toIndex: number = -1;
  waiting: boolean = false;
  isTurn: boolean = false;
  waitingForSecondPlayer: boolean = false;
  coordinates: Coord[] = [];
  private game: IGame = new Game();

  constructor(public _blockchainService: BlockchainService) {
    this.initPosList();
    _blockchainService.positions$.subscribe(positions => this.refreshTable(positions))
  }

  ngOnInit(): void {
  }

  private initPosList() {
    const step: number = 100;
    for (let i = 0; i < 24; i++) {
      let circle: number = Math.floor(i / 8);
      let posInCircle: number = i % 8;
      let leftPos: number = posInCircle === 0 || posInCircle === 7 || posInCircle === 6 ? 0 : posInCircle === 1 || posInCircle === 5 ? 1 : 2;
      let topPos: number = posInCircle < 3 ? 0 : posInCircle === 3 || posInCircle === 7 ? 1 : 2;
      let paddingSide = circle * step;
      let distance = (3 - circle) * step;
      this.coordinates.push(new Coord((paddingSide + leftPos * distance) + "px", (paddingSide + topPos * distance) + "px"));
    }
  }

  private refreshTable(positions: COLOR[]): void {
    this.positions = positions;
    this.fromIndexIndex = -1;
    this.toIndex = -1;
    this.game = this._blockchainService.myGame$.value as IGame;
    this.isTurn = (this._blockchainService.ownColor == COLOR.WHITE) == (this.game.round.toNumber() % 2 == 0)
    this.waitingForSecondPlayer = GameHelper.isEmptyAdress(this.game.black);
  }

  pieceClicked(index: number) {
    if (this.waiting || !this.isTurn) {
      return;
    }
    if (this.fromIndexIndex === index) {
      this.fromIndexIndex = -1;
      this.toIndex = -1;
      this.removeIndex = -1;
      return;
    }
    if (this.toIndex === index) {
      this.fromIndexIndex = -1;
      this.removeIndex = -1;
      return;
    }
    if(this.removeIndex  === index)
    {
      this.removeIndex = -1;
    }
    this.removeIndex = -1;
    let makeMove: boolean = false;
    let oponentColor = this._blockchainService.ownColor === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
    if (this.positions[index] === oponentColor) {
      if (this.toIndex >= 0 && (this.game.round.toNumber() < 18 || this.fromIndexIndex >= 0)
        && this.positions[index] === oponentColor && !GameHelper.makesMill(index, this.positions, oponentColor)) {
        makeMove = true;
        this.removeIndex  = index;
      }
    }
    else if (this.game.round.toNumber() < 18) {
      if (this.positions[index] === COLOR.UNDEFINED) {
        this.toIndex = index;
        if(!GameHelper.makesMill(index, this.positions, this._blockchainService.ownColor))
        {
          makeMove = true;
        }
      }
    }
    else if (this.fromIndexIndex === -1) {      
        if(this.positions[index] === this._blockchainService.ownColor)
        {
          this.fromIndexIndex = index;
        }
    }
    else if(this.toIndex === -1 && this.positions[index] === COLOR.UNDEFINED 
      && (GameHelper.countColors(this._blockchainService.ownColor,this.positions) === 3 || GameHelper.areSideBySide(this.fromIndexIndex, index)))
    {
      this.toIndex = index;      
      if(GameHelper.hasOnlyMills(oponentColor,this.positions) || !GameHelper.makesMill(index, this.positions, this._blockchainService.ownColor, this.fromIndexIndex))
      {
          makeMove = true;
      }
    }

    if (makeMove) {
      this.waiting = true;
      this._blockchainService.makeMove(this.toIndex, this.fromIndexIndex, this.removeIndex).subscribe(() => this.waiting = false);
    }
  }

}
