import { APIRequest } from '../../APIRequest';
import { AvailableGames } from "../../../visualizers/BaseVisualizer/AvailableGames";
import { RESTTypes }   from "../../../enums/RESTTypes"

export class PlayerFeatureListRequest extends APIRequest {
   /**
    * @param {RESTTypes}  request_type
    * @param {AvailableGames} game
    */
   constructor(request_type=RESTTypes.GET,
               game=AvailableGames.EnumList()[0]) {
      super(request_type, game,
            null, null,
            null, null);
   }

   /**
    * @returns {string}
    */
   URLPath() {
      return `/players/metrics/list/${this.Game}`
   }

   /**
    * @returns {URLSearchParams}
    */
   HeaderParams() {
      return new URLSearchParams();
   }

   /**
    * @returns {FormData}
    */
   BodyParams() {
      return new FormData()
   }

   genLocalStorageKey() {
      /**
       * @returns {string}
       */
      return ["PLAYER", this.game_name, "FeatureList"].join("/")
   }
}