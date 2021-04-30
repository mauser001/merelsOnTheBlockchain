import { COLOR } from "../enums/color.enum";

export class GameHelper {
    static isEmptyAdress(str:string)
    {
        return str === "0x0000000000000000000000000000000000000000";
    }
    static areSideBySide(first: number, second: number): boolean {
        let valid: boolean = false;
        let posInCircle: number = first % 8;
        let circle: number = Math.floor(first / 8);
        let pos2InCircle: number = second % 8;
        let circle2: number = Math.floor(second / 8);
        if (circle2 == circle) {
            if (Math.abs(posInCircle - pos2InCircle) == 1 || (pos2InCircle == 7 && posInCircle == 0) || (pos2InCircle == 0 && posInCircle == 7)) {
                valid = true;
            }
        } else {
            if (Math.abs(circle2 - circle) == 1 && pos2InCircle == posInCircle && pos2InCircle % 2 == 1) {
                valid = true;
            }
        }
        return valid;
    }

    static hasOnlyMills(color: COLOR, list:COLOR[]):boolean
    {
        let isTrue:boolean = true;
        for(let i:number = 0; i < list.length; i++)
        {
            if(list[i] === color && !this.makesMill(i, list, color))
            {
                isTrue = false;
                break;
            }
        }
        return isTrue;
    }

    static countColors(color: COLOR, list:COLOR[]):number
    {
        let count:number = 0;
        list.forEach(c => {
            if(c === color)
            {
                count ++;
            }
        })
        return count;
    }

    static makesMill(pos: number, origialPositions: COLOR[], color: COLOR, removePos: number = -1): boolean {
        let positions: COLOR[] = origialPositions.concat([]);
        positions[pos] = color;
        if(removePos > 0)
        {
            positions[removePos] = COLOR.UNDEFINED;
        }
        let posInCircle: number = pos % 8;
        let circle: number = Math.floor(pos / 8);

        let isMill: boolean = false;
        if (posInCircle % 2 == 1) {
            if (
                posInCircle == 7 &&
                positions[pos - 1] == color &&
                positions[pos - 7] == color
            ) {
                isMill = true;
            } else if (
                posInCircle < 7 &&
                positions[pos - 1] == color &&
                positions[pos + 1] == color
            ) {
                isMill = true;
            } else if (
                circle == 0 &&
                positions[pos + 8] == color &&
                positions[pos + 16] == color
            ) {
                isMill = true;
            } else if (
                circle == 1 &&
                positions[pos - 8] == color &&
                positions[pos + 8] == color
            ) {
                isMill = true;
            } else if (
                circle == 2 &&
                positions[pos - 8] == color &&
                positions[pos - 16] == color
            ) {
                isMill = true;
            }
        } else if (posInCircle == 0) {
            if (
                positions[pos + 1] == color &&
                positions[pos + 2] == color
            ) {
                isMill = true;
            } else if (
                positions[pos + 6] == color &&
                positions[pos + 7] == color
            ) {
                isMill = true;
            }
        } else if (posInCircle == 6) {
            if (
                positions[pos - 1] == color &&
                positions[pos - 2] == color
            ) {
                isMill = true;
            } else if (
                positions[pos + 1] == color &&
                positions[pos - 6] == color
            ) {
                isMill = true;
            }
        } else {
            if (
                positions[pos + 1] == color &&
                positions[pos + 2] == color
            ) {
                isMill = true;
            } else if (
                positions[pos - 1] == color &&
                positions[pos - 2] == color
            ) {
                isMill = true;
            }
        }
        return isMill;
    }
}
