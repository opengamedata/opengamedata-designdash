import EnumType from "../../enums/EnumType";
import { game_list } from '../../config';
/**
 * Default options for dropdown item
 */
export class AvailableGames extends EnumType {
   static EnumList() {
      return game_list.map((game) => new AvailableGames(game));
   }

   static Default() {
      return this.EnumList()[0]
   }

   constructor(name, readable=name) {
      super(name, readable);
   }
}