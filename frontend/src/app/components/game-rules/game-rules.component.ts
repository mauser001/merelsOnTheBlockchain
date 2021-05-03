import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-game-rules',
  templateUrl: './game-rules.component.html',
  styleUrls: ['./game-rules.component.less']
})
export class GameRulesComponent implements OnInit {
  isOpen:boolean = false;
  constructor(public _blockchainService:BlockchainService) { }

  ngOnInit(): void {
  }

}
