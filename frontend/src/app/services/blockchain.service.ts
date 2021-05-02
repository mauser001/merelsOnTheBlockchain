import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
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
  NO_METAMASK = "no metamask",
  WRONG_NETWORK = "wrong network",
  NO_CONTRACT = "no contract",
  CONTRACT_CONNECTED = "conntected"
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  readonly connection:Connection = {    
    contractAddress: "0xafFD6827c32425DB36Ce9879bB3ED28E9f3ea142",
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

  state$: BehaviorSubject<BLOCK_STATE> = new BehaviorSubject<BLOCK_STATE>(BLOCK_STATE.DEFAULT);
  account$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  myGame$: BehaviorSubject<IGame | undefined> = new BehaviorSubject<IGame | undefined>(undefined);
  positions$: BehaviorSubject<COLOR[]> = new BehaviorSubject<COLOR[]>([]);
  gameCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  games$: BehaviorSubject<IGame[]> = new BehaviorSubject<IGame[]>([]);
  winnerList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  luckyPlayer$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  ownColor: COLOR = COLOR.UNDEFINED;

  constructor(public _ref: ApplicationRef) {
  };

  connectAccount() {
    this.state$.next(BLOCK_STATE.INIT);
    if (window.ethereum) {
      try {
        window.ethereum.send('eth_requestAccounts').then(() => {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          this.setupEventHandler();
          this.checkNetwork();
        },
          (error: any) => {
            console.log("error connecting to metamask: " + error);
            this.state$.next(BLOCK_STATE.NO_METAMASK);
          });
      }
      catch (e) {
        this.state$.next(BLOCK_STATE.ERROR);
      }
    }
    else {
      this.state$.next(BLOCK_STATE.NO_METAMASK);
    }

  }

  private setupEventHandler() {
    if (!this.eventHandlersAdded) {
      window.ethereum.on('accountsChanged', (accounts: any[]) => {
        console.log("accountsChanged: " + accounts[0]);
        this.cleanUp();
        if (!accounts.length) {
          this.state$.next(BLOCK_STATE.NO_METAMASK);        
          this._ref.tick();
        }
        else
        {
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
    this.account$.next("");
    this.myGame$.next(undefined);
    this.positions$.next([]);
    this.gameCount$.next(0);
    this.games$.next([]);
  }

  private checkNetwork() {
    this.provider.getNetwork().then((network: INetwork) => {
      if (network.chainId === this.connection.chainId) {
        this.checkSigner();
      }
      else {
        this.state$.next(BLOCK_STATE.WRONG_NETWORK);
      }
    },
      (error: any) => {
        console.log("error getting network from metamask: " + error);
        this.state$.next(BLOCK_STATE.NO_METAMASK);
      });
  }

  private checkSigner() {
    try {
      this.signer = this.provider.getSigner();
      if (this.signer) {
        this.signer.getAddress().then((account: any) => {
          if (account) {
            if (this.account$.getValue() !== account) {
              this.account$.next(account);
            }
            if (account) {
              this.contract = new ethers.Contract(this.connection.contractAddress, Merels.abi, this.provider);
              this.contract.on("GameStarted", (author: any, event: any) => {
                console.log("GameStarted event received");
                if (event.args[0] === this.account$) {
                  this.updateGameInformations();
                }
              });
              this.contract.on("GameJoined", (author: any, event: any) => {
                console.log("GameJoined event received");
                if (event.args[1] === this.account$ || event.args[0] === this.account$) {
                  this.updateGameInformations();
                }
              });
              
              this.contract.on("LuckyPlayer", (author: any, event: any) => {
                console.log("LuckyPlayer event received -> "+event.args[0]);
                this.luckyPlayer$.next(event.args[0]);
              });
                            
              this.contract.on("WonGame", (author: any, event: any) => {
                console.log("WonGame event received -> "+event.args[0]);
                this.winnerList$.next(this.winnerList$.getValue().concat(event.args[0]));
              });

              this.contract.on("MadeMove", (author: any, event: any) => {
                console.log("MadeMove event received");
                if (author === (this.myGame$.value as IGame).white || author === (this.myGame$.value as IGame).black) {
                  setTimeout(()=>{
                    if(!this.makeMoveListener.closed)
                    {
                      this.makeMoveListener.next(true);
                      this.makeMoveListener.complete();
                    }
                    this.updateGameInformations();
                  }, author === this.ownColor ? 1000 : 0)
                }
              });

              //makeMoveListener

              if (this.contract) {
                this.state$.next(BLOCK_STATE.CONTRACT_CONNECTED);
                this.updateGameInformations();
              }
              else {
                this.state$.next(BLOCK_STATE.NO_METAMASK);
              }
            }
            else {
              this.state$.next(BLOCK_STATE.NO_METAMASK);
            }
          }
        },
          (error: any) => {
            console.log("error getting singer from metamask: " + error);
            this.state$.next(BLOCK_STATE.NO_METAMASK);
          })
      }
      else {
        console.log("no signer");
        this.state$.next(BLOCK_STATE.NO_METAMASK);
      }
    }
    catch (e) {
      console.log("error getting singer from metamask: " + e);
      this.state$.next(BLOCK_STATE.NO_METAMASK);
    }
  }

  private updateGameInformations() {
    if (this.contract) {
      this.contract.gameCount().then((bigCount: BigNumber) => {
        let count: number = bigCount.toNumber();
        this.gameCount$.next(count);
        if (count > 0) {
          let promises: Promise<IGame>[] = [];
          for (let i = 0; i < count; i++) {
            promises.push(this.contract.games(BigNumber.from(i)))
          }
          Promise.all(promises).then(games => {
            this.games$.next(games);
            this.myGame$.next(games.find(game => {
              return game.white === this.account$.getValue() || game.black === this.account$.getValue();
            }));
            if (this.myGame$.getValue()) {
              this.ownColor = this.myGame$.value?.white === this.account$.value ? COLOR.WHITE : COLOR.BLACK;
              this.updateMyPositions();
            }
            else {
              this._ref.tick();
            }
          },
            (error: any) => console.log("error getting games: " + error));
        }
        else {
          this.myGame$.next(undefined);
        }
      }, (error: any) => console.log("error getting count: " + error));
    }
  }

  private updateMyPositions() {
    if (this.myGame$.getValue()) {
      this.contract.getPositions((this.myGame$.getValue() as IGame).index.add(1)).then((positions: COLOR[]) => {
        this.positions$.next(positions);
        this._ref.tick();
      }, (error: any) => {
        console.log("error getting positiosn: " + error);
        this.positions$.next([]);
      });
    }
    else {
      this.positions$.next([]);
    }
  }

  async openGame() {
    let overrides: any = {
      value: ethers.utils.parseEther(this.connection.costInEth),
      from: this.account$.value
    };
    let gas: BigNumber = await this.contract.estimateGas.startGame(overrides);
    overrides.gasLimit = gas;
    let transaction = await this.contract.populateTransaction.startGame(overrides);
    await this.signer.sendTransaction(transaction);
  }

  async joinGame(game: IGame) {
    let overrides: any = {
      value: ethers.utils.parseEther(this.connection.costInEth),
      from: this.account$.value
    };
    let gas: BigNumber = await this.contract.estimateGas.joinGame(game.white, overrides);
    overrides.gasLimit = gas;
    let transaction = await this.contract.populateTransaction.joinGame(game.white, overrides);
    await this.signer.sendTransaction(transaction);
  }

  makeMove(to: number, from: number = -1, remove: number = -1): Subject<any> {
    this.makeMoveListener = new Subject<any>();
    let overrides: any = {
      from: this.account$.value
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
}
