import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BigNumber } from '@ethersproject/bignumber';
import { BehaviorSubject, of } from 'rxjs';
import { COLOR } from 'src/app/enums/color.enum';
import { Game } from 'src/app/models/game';
import { IGame } from 'src/app/models/interfaces/igame';
import { BlockchainService } from 'src/app/services/blockchain.service';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let myGame$Spy: BehaviorSubject<IGame>;
  let positions$: BehaviorSubject<COLOR[]>;

  beforeEach(async () => {
    const blockchainService = jasmine.createSpyObj('BlockchainService', ['positions$', 'myGame$', 'getPositions']);
    myGame$Spy = blockchainService.myGame$ = new BehaviorSubject<IGame>(new Game());
    positions$ = blockchainService.positions$ = new BehaviorSubject<COLOR[]>([]);
    blockchainService.getPositions.and.returnValue(of());
    await TestBed.configureTestingModule({
      declarations: [TableComponent],
      providers: [{ provide: BlockchainService, useValue: blockchainService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should show pices', () => {
    let game:IGame = new Game();
    game.black = "0x1";
    game.white = "0x2";
    myGame$Spy.next(game);
    positions$.next([COLOR.UNDEFINED, COLOR.BLACK, COLOR.WHITE]);

    fixture.detectChanges();

    const element = fixture.debugElement.nativeElement.querySelector('.no-color');
    expect(element).toBeTruthy();
  });

  it('should find no COLOR.UNDEFINED element', () => {
    let game:IGame = new Game();
    game.black = "0x1";
    game.white = "0x2";
    myGame$Spy.next(game);
    positions$.next([COLOR.WHITE, COLOR.BLACK, COLOR.WHITE]);

    fixture.detectChanges();

    const element = fixture.debugElement.nativeElement.querySelector('.no-color');
    expect(element).toBeFalsy();
  });*/
});
