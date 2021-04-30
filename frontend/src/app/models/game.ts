import { BigNumber } from "@ethersproject/bignumber";
import { IGame } from "./interfaces/igame";

export class Game implements IGame{    
    white:string = "";
    black: string = "";
    round: BigNumber = BigNumber.from(0);
    index: BigNumber = BigNumber.from(0);
}