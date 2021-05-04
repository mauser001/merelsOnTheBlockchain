import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { BigNumber, ethers, providers } from "ethers";
import * as Merels from '../../assets/contract/Merels.json';
import { COLOR } from '../enums/color.enum';
import { INetwork } from '../models/interfaces/inetwork';
import { IGame } from '../models/interfaces/igame';
import { Connection } from '../models/interfaces/connection';

declare global {
  interface Window { ethereum: any; web3: any }
}

export enum BLOCK_STATE {
  DEFAULT = "default",
  INIT = "init",
  ERROR = "error",
  WAITING_FOR_METAMASK = "waiting for metamask",
  NO_METAMASK = "no metamask",
  WRONG_NETWORK = "wrong network",
  NO_CONTRACT = "no contract",
  CONTRACT_CONNECTED = "conntected"
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  readonly connection: Connection = {
    contractAddress: "0xA32184068c12a6476e8E1f3f3f86D6e563390453",
    chainId: 80001,
    chainRpc: "https://rpc-mumbai.maticvigil.com/",
    chainName: "Matic Mumbai Testnet",
    currencySymbol: "Matic",
    blockExplorerUrl: "https://mumbai-explorer.matic.today",
    costInEth: "0.01"
  }
  private provider: any;
  private signer: any;
  private contract: any;
  private eventHandlersAdded: boolean = false;

  private makeMoveListener: Subject<any> = new Subject<any>();
  private initTimeout: any;

  private _state$: BehaviorSubject<BLOCK_STATE> = new BehaviorSubject<BLOCK_STATE>(BLOCK_STATE.DEFAULT);
  private _account$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _myGame$: BehaviorSubject<IGame | undefined> = new BehaviorSubject<IGame | undefined>(undefined);
  private _positions$: BehaviorSubject<COLOR[]> = new BehaviorSubject<COLOR[]>([]);
  private _gameCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _games$: BehaviorSubject<IGame[]> = new BehaviorSubject<IGame[]>([]);
  private _winnerList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private _luckyPlayer$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _ownColor: COLOR = COLOR.UNDEFINED;

  constructor(public _ref: ApplicationRef) {
  };

  connectAccount() {
    this._state$.next(BLOCK_STATE.INIT);
    if (window.ethereum) {
      try {
        this.initTimeout = setTimeout(() => {
          this.initTimeout = undefined;
          this._state$.next(BLOCK_STATE.WAITING_FOR_METAMASK);
        }, 1000);
        window.ethereum.send('eth_requestAccounts').then(() => {
          this.clearInitTimeout();
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          this.setupEventHandler();
          this.checkNetwork();
        },
          (error: any) => {
            console.log("error connecting to metamask: " + error);
            this.clearInitTimeout();
            this._state$.next(BLOCK_STATE.NO_METAMASK);
          });
      }
      catch (e) {
        this._state$.next(BLOCK_STATE.ERROR);
      }
    }
    else {
      this._state$.next(BLOCK_STATE.NO_METAMASK);
    }

  }

  private clearInitTimeout() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = undefined;
    }
  }

  private setupEventHandler() {
    if (!this.eventHandlersAdded) {
      window.ethereum.on('accountsChanged', (accounts: any[]) => {
        console.log("accountsChanged: " + accounts[0]);
        this.cleanUp();
        if (!accounts.length) {
          this._state$.next(BLOCK_STATE.NO_METAMASK);
          this._ref.tick();
        }
        else {
          this.checkSigner();
        }
      });

      window.ethereum.on('networkChanged', (networkId: string) => {
        console.log("network changed: " + networkId);
        this.cleanUp();
        this.checkNetwork();
      });
      window.ethereum.on('connect', () => {
        console.log("network connected!");
        this.cleanUp();
        this.checkNetwork();
      });
      window.ethereum.on('disconnect', () => {
        console.log("network disconnect");
        this.cleanUp();
      });
    }
  }

  private cleanUp() {
    this._account$.next("");
    this._myGame$.next(undefined);
    this._positions$.next([]);
    this._gameCount$.next(0);
    this._games$.next([]);
  }

  private checkNetwork() {
    this.provider.getNetwork().then((network: INetwork) => {
      if (network.chainId === this.connection.chainId) {
        this.checkSigner();
      }
      else {
        this._state$.next(BLOCK_STATE.WRONG_NETWORK);
      }
    },
      (error: any) => {
        console.log("error getting network from metamask: " + error);
        this._state$.next(BLOCK_STATE.NO_METAMASK);
      });
  }

  private checkSigner() {
    try {
      this.signer = this.provider.getSigner();
      if (this.signer) {
        this.signer.getAddress().then((account: any) => {
          if (account) {
            if (this._account$.value !== account) {
              this._account$.next(account);
            }
            if (!this.contract) {
              this.contract = new ethers.Contract(this.connection.contractAddress, Merels.abi, this.provider);
              this.contract.on("GameStarted", (author: any) => {
                console.log("GameStarted event received");
                if (author === this._account$.value) {
                  this.updateGameInformations();
                }
              });
              this.contract.on("GameJoined", (author: any, white: any) => {
                console.log("GameJoined event received");
                if (author === this._account$.value || white === this._account$.value) {
                  this.updateGameInformations();
                }
              });

              this.contract.on("LuckyPlayer", (author: any, event: any) => {
                console.log("LuckyPlayer event received -> " + event.args[0]);
                this._luckyPlayer$.next(event.args[0]);
              });

              this.contract.on("WonGame", (author: any, event: any) => {
                console.log("WonGame event received -> " + event.args[0]);
                this._winnerList$.next(this._winnerList$.getValue().concat(event.args[0]));
              });

              this.contract.on("MadeMove", (author: any, event: any) => {
                console.log("MadeMove event received");
                if (author === (this._myGame$.value as IGame).white || author === (this._myGame$.value as IGame).black) {
                  setTimeout(() => {
                    if (!this.makeMoveListener.closed) {
                      this.makeMoveListener.next(true);
                      this.makeMoveListener.complete();
                    }
                    this.updateGameInformations();
                  }, author === this._ownColor ? 1000 : 0)
                }
              });
            }
            if (this.contract) {
              this._state$.next(BLOCK_STATE.CONTRACT_CONNECTED);
              this.updateGameInformations();
            }
            else {
              this._state$.next(BLOCK_STATE.NO_METAMASK);
            }
          }
          else {
            this._state$.next(BLOCK_STATE.NO_METAMASK);
          }
        },
          (error: any) => {
            console.log("error getting singer from metamask: " + error);
            this._state$.next(BLOCK_STATE.NO_METAMASK);
          })
      }
      else {
        console.log("no signer");
        this._state$.next(BLOCK_STATE.NO_METAMASK);
      }
    }
    catch (e) {
      console.log("error getting singer from metamask: " + e);
      this._state$.next(BLOCK_STATE.NO_METAMASK);
    }
  }

  private updateGameInformations() {
    if (this.contract) {
      this.contract.gameCount().then((bigCount: BigNumber) => {
        let count: number = bigCount.toNumber();
        this._gameCount$.next(count);
        if (count > 0) {
          let promises: Promise<IGame>[] = [];
          for (let i = 0; i < count; i++) {
            promises.push(this.contract.games(BigNumber.from(i)))
          }
          Promise.all(promises).then(games => {
            this._games$.next(games);
            this._myGame$.next(games.find(game => {
              return game.white === this._account$.value || game.black === this._account$.value;
            }));
            if (this._myGame$.getValue()) {
              this._ownColor = this._myGame$.value?.white === this._account$.value ? COLOR.WHITE : COLOR.BLACK;
              this.updateMyPositions();
            }
            else {
              this._ref.tick();
            }
          },
            (error: any) => console.log("error getting games: " + error));
        }
        else {
          this._myGame$.next(undefined);
        }
      }, (error: any) => console.log("error getting count: " + error));
    }
  }

  private updateMyPositions() {
    if (this._myGame$.getValue()) {
      this.contract.getPositions((this._myGame$.getValue() as IGame).index.add(1)).then((positions: COLOR[]) => {
        this._positions$.next(positions);
        this._ref.tick();
      }, (error: any) => {
        console.log("error getting positiosn: " + error);
        this._positions$.next([]);
      });
    }
    else {
      this._positions$.next([]);
    }
  }

  async openGame() {
    let overrides: any = {
      value: ethers.utils.parseEther(this.connection.costInEth),
      from: this._account$.value
    };
    let gas: BigNumber = await this.contract.estimateGas.startGame(overrides);
    overrides.gasLimit = gas;
    let transaction = await this.contract.populateTransaction.startGame(overrides);
    await this.signer.sendTransaction(transaction);
  }

  async joinGame(game: IGame) {
    let overrides: any = {
      value: ethers.utils.parseEther(this.connection.costInEth),
      from: this._account$.value,
      gasLimit: "10000000"
    };
    let gas: BigNumber = await this.contract.estimateGas.joinGame(game.white, overrides);
    overrides.gasLimit = gas;
    let transaction = await this.contract.populateTransaction.joinGame(game.white, overrides);
    await this.signer.sendTransaction(transaction);
  }

  makeMove(to: number, from: number = -1, remove: number = -1): Subject<any> {
    this.makeMoveListener = new Subject<any>();
    let overrides: any = {
      from: this._account$.value
    };
    this.contract.estimateGas.makeMove(to, from, remove, overrides).then((cost: BigNumber) => {
      overrides.gasLimit = cost;
      this.contract.populateTransaction.makeMove(to, from, remove, overrides).then((transaction: any) => {
        this.signer.sendTransaction(transaction).then(() => { }, (error: any) => {
          console.log("error sending makeMove: " + error);
          this.makeMoveListener.next(false);
          this.makeMoveListener.complete();
        })
      }, (error: any) => {
        console.log("error creating makeMove: " + error);
        this.makeMoveListener.next(false);
        this.makeMoveListener.complete();
      })
    }, (error: any) => {
      console.log("error getting cost of makeMove: " + error);
      this.makeMoveListener.next(false);
      this.makeMoveListener.complete();
    })
    return this.makeMoveListener;
  }

  /**
   * Data getters
   */
   get ownColor(): COLOR{
     return this._ownColor;
   }
   get state$():Observable<BLOCK_STATE>
   {
     return this._state$ as Observable<BLOCK_STATE>;
   }
   get account$():Observable<string>
   {
     return this._account$ as Observable<string>;
   }
   get myGame$():Observable<IGame>
   {
     return this._myGame$ as Observable<IGame>;
   }
   get positions$():Observable<COLOR[]>
   {
     return this._positions$ as Observable<COLOR[]>;
   }
   get gameCount$():Observable<number>
   {
     return this._gameCount$ as Observable<number>;
   }
   get games$():Observable<IGame[]>
   {
     return this._games$ as Observable<IGame[]>;
   }
   get winnerList$():Observable<string[]>
   {
     return this._winnerList$ as Observable<string[]>;
   }
   get luckyPlayer$():Observable<string>
   {
     return this._luckyPlayer$ as Observable<string>;
   }
}