import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-installation-tutorial',
  templateUrl: './installation-tutorial.component.html',
  styleUrls: ['./installation-tutorial.component.less']
})
export class InstallationTutorialComponent implements OnInit {

  constructor(public _blockchainService:BlockchainService) { }

  ngOnInit(): void {
  }

}
