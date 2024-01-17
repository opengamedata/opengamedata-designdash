import { APIRequest } from '../../APIRequest';
import { AvailableGames } from "../../../enums/AvailableGames";
import { RESTTypes } from "../../../enums/RESTTypes"
import { ISODatetimeFormat } from '../../../utils/TimeFormat';

export class PopulationMetricsRequest extends APIRequest {
   /**
    * @param {string[]} features
    * @param {RESTTypes}  request_type
    * @param {AvailableGames} game
    * @param {string | null} min_app_version
    * @param {string | null} max_app_version
    * @param {string | null} min_log_version
    * @param {string | null} max_log_version
    * @param {Date | null} start_date
    * @param {Date | null} end_date
    */
   constructor(features,
               request_type=RESTTypes.POST,
               game=AvailableGames.EnumList()[0],
               min_app_version=null, max_app_version=null,
               min_log_version=null, max_log_version=null,
               start_date     =null, end_date       =null) {
      super(request_type, game,
            min_app_version, max_app_version,
            min_log_version, max_log_version);
      if (start_date === null) {
         console.warn("start_date was null! Defaulting to today.")
      }
      if (end_date === null) {
         console.warn("end_date was null! Defaulting to today.")
      }
      this.features = features;
      this.start_date = start_date ?? new Date();
      this.end_date   = end_date   ?? new Date();
   }

   URLPath() {
      /**
       * @returns {string}
       */
      return "/populations/metrics"
   }
   HeaderParams() {
      /**
       * @returns {Object.<string, object>}
       */
      return {}
   }
   BodyParams() {
      /**
       * @returns {Object.<string, object>}
       */
      return {
         "game_id"        : this.Game,
         "start_datetime" : this.start_date.toISOString().split('T')[0] + 'T00:00',
         "end_datetime"   : this.end_date.toISOString().split('T')[0] + 'T23:59',
         "metrics"        : this.features
      }
   }

   genLocalStorageKey() {
      /**
       * @returns {string}
       */
      let _start = ISODatetimeFormat(this.start_date);
      let _end   = ISODatetimeFormat(this.end_date);
      return ["POPULATION", this.game_name, this.min_app_version, this.max_app_version,
               this.min_log_version, this.max_log_version, _start, _end].join("/")
   }
}