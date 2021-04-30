import { Pipe, PipeTransform } from '@angular/core';
import { IGame } from '../models/interfaces/igame';
import { GameHelper } from '../utils/game-helper';

@Pipe({
  name: 'openGames'
})
export class OpenGamesPipe implements PipeTransform {

  transform(games: IGame[] | null): IGame[] {
    return games ? games.filter(game => GameHelper.isEmptyAdress(game.black)) : [];
  }

}
