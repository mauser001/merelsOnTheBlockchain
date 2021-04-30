import { BigNumber } from "@ethersproject/bignumber";

export interface IGame {
    white: string;
    black: string;
    round: BigNumber;
    index: BigNumber;
}
