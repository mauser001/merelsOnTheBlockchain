import { Component, OnInit } from '@angular/core';
import { BlockchainService, BLOCK_STATE } from './services/blockchain.service';
import { IGame } from './models/interfaces/igame';
import { COLOR } from './enums/color.enum';
import { version } from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  _BLOCK_STATE: typeof BLOCK_STATE = BLOCK_STATE;
  _COLOR: typeof COLOR = COLOR;
  _version: string = version;

  constructor(public _blockchainService: BlockchainService) {}

  connect()
  {
    this._blockchainService.connectAccount(); 
  }

  openGame()
  {
    this._blockchainService.openGame();
  }

  joinGame(game: IGame)
  {
    this._blockchainService.joinGame(game);
  }

  ngOnInit(): void {
    this.connect();
  }
}
