import { Component, OnInit } from '@angular/core';
import { BigNumber } from '@ethersproject/bignumber';
import { BlockchainService, BLOCK_STATE } from './services/blockchain.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { IGame } from './models/interfaces/igame';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  _BLOCK_STATE: typeof BLOCK_STATE = BLOCK_STATE;

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
