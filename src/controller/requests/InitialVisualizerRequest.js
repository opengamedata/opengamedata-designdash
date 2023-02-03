import VisualizerRequest from "./VisualizerRequest";
import { AvailableGames } from "../../model/enums/AvailableGames";
import { FilterRequest, FilterItem, InputModes, ValueModes } from "./FilterRequest";
import { InitialVisualizerModel } from "../../model/visualizations/InitialVisualizerModel";

/**
 * @typedef {import("../../model/visualizations/VisualizerModel").default} VisualizerModel
 * @typedef {import("./APIRequest").APIRequest} APIRequest
 */

export default class InitialVisualizerRequest extends VisualizerRequest {
   constructor() {
      super();
      this.filter_request = new FilterRequest();
      this.filter_request.AddItem(
         new FilterItem("Game", InputModes.DROPDOWN, ValueModes.ENUM, {'type':AvailableGames, 'selected':AvailableGames.EnumList[0]})
      )
   }

   /**
    * @returns {FilterRequest}
    */
   GetFilterRequest() {
      return this.filter_request;
   }

   /**
    * @param {object} requesterState
    * @returns {APIRequest?} The API request that gets the visualizer's required data.
    */
   GetAPIRequest(requesterState) {
      return null;
   }

   /**
    * @param {object} requesterState
    * @param {object} rawData
    * @returns {VisualizerModel} A model of the kind expected by the visualizer.
    */
   GetVisualizerModel(requesterState, rawData) {
      return new InitialVisualizerModel();
   }
}