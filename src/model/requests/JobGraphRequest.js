import VisualizerRequest from "./VisualizerRequest";
import { AvailableGames } from "../enums/AvailableGames";
import { FilterRequest, FilterItem, InputModes, ValueModes } from "./FilterRequest";
import { JobGraphModel } from "../visualizations/JobGraphModel";
import { APIRequest } from "./APIRequest";
import RequestModes from "../enums/RequestModes";

/**
 * @typedef {import("../visualizations/VisualizerModel").default} VisualizerModel
 * @typedef {import('../../typedefs').FeaturesMap} FeaturesMap
 * @typedef {import("../../typedefs").MapSetter} MapSetter
 * @typedef {import("../../typedefs").Validator} Validator
 */

export default class JobGraphRequest extends VisualizerRequest {
   /**
    * @param {MapSetter} updateRequesterState
    */
   constructor(updateRequesterState) {
      super(updateRequesterState);
      this.filter_request = new FilterRequest(this.updateRequesterState);
      this.filter_request.AddItem(
         new FilterItem("Game", InputModes.DROPDOWN, ValueModes.ENUM, {"type":AvailableGames, "selected":AvailableGames.EnumList[0]})
      )
      let startDate = new Date();
      let endDate = new Date();
      /** @type {Validator} */
      this.filter_request.AddItem(
         new FilterItem("DateRange", InputModes.RANGE, ValueModes.DATE, {'min':startDate, 'max':endDate}, JobGraphRequest.DateValidator)
      )
      this.filter_request.AddItem(
         new FilterItem("AppVersionRange", InputModes.RANGE, ValueModes.TEXT, {'min':"*", 'max':"*"}, JobGraphRequest.VersionValidator("App"))
      )
      this.filter_request.AddItem(
         new FilterItem("LogVersionRange", InputModes.RANGE, ValueModes.TEXT, {'min':"*", 'max':"*"}, JobGraphRequest.VersionValidator("Log"))
      )
      this.filter_request.AddItem(
         new FilterItem("MinimumJobs", InputModes.RANGE, ValueModes.NUMBER, {'min':0, 'max':null}, JobGraphRequest.MinJobsValidator)
      )
      this.viz_model = new JobGraphModel(AvailableGames.EnumList[0].asString, null, null)
   }

   /**
    * @type {Validator}
    */
   static GameValidator(vals) {
      const gameSelected = vals['selected'];
      if (!gameSelected) {
            // prompt user
            alert('make sure a game has been selected!');
            return false;
      }
      else {
         return true;
      }
   }

   /**
    * @type {Validator}
    */
   static DateValidator(vals) {
      // if empty fields, prompt user to fill in the blanks & return
      // if (!(game && version && startDate && endDate && minPlaytime >= 0 && maxPlaytime)) {
      const startDate = vals['min'];
      const endDate = vals['max']
      const today = new Date();
      const queryEnd = new Date(endDate)
      // console.log(today, queryEnd)
      // console.log(today - queryEnd)
      if (startDate == null || endDate == null) {
         alert("Need to select both a start and an end date!")
         return false;
      }
      if (startDate > endDate) {
         alert("The start date must not be later than the end date!")
         return false;
      }
      else if (today.getTime() - queryEnd.getTime() <= 1000 * 60 * 60 * 24) {
            alert('select an end date that\'s prior to yesterday')
            return false;
      }
      else {
         return true;
      }
   }

   /**
    * 
    * @param {string} name 
    * @returns {Validator}
    */
   static VersionValidator(name) {
      return (vals) => {
         const minVersion = vals['min'];
         const maxVersion = vals['max']
         if (minVersion !== null && maxVersion !== null && minVersion > maxVersion) {
            alert(`The minimum ${name} version must be less than the maximum!`)
            return false;
         }
         else {
            return true;
         }
      }
   }

   /**
    * @type {Validator}
    */
   static MinJobsValidator(vals) {
         const minPlaytime = vals['min'];
         const maxPlaytime = vals['max']
      if (minPlaytime != null && maxPlaytime != null && minPlaytime > maxPlaytime) {
         alert('The minimum play time must be less than the maximum!')
         return false;
      }
      else {
         return true;
      }
   }

   /**
    * @param {object} requesterState
    * @returns {APIRequest?} The API request that gets the visualizer's required data.
    */
   GetAPIRequest(requesterState) {
      const RequiredExtractors = {
         "AQUALAB": [
            'ActiveJobs',
            'JobsAttempted-avg-time-per-attempt',
            'JobsAttempted-job-name',
            'JobsAttempted-job-difficulties',
            'TopJobCompletionDestinations',
            'TopJobSwitchDestinations',
            'PlayerSummary',
            'PopulationSummary',
         ],
         "SHIPWRECKS": [
            'ActiveJobs',
            'JobsAttempted',
            'PlayerSummary',
            'PopulationSummary'
         ]
      };
      const game = requesterState['GameSelected']
      return new APIRequest(RequestModes.POPULATION, RequiredExtractors[game], game,
                                   requesterState['AppVersionRangeMin'], requesterState['AppVersionRangeMax'],
                                   requesterState['LogVersionRangeMin'], requesterState['LogVersionRangeMax']
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
    * @param {object} rawData
    * @returns {VisualizerModel} A model of the kind expected by the visualizer.
    */
   GetVisualizerModel(requesterState, rawData) {
      if (this.viz_model.dataNotEqual(rawData)) {
         this.viz_model = new JobGraphModel(requesterState['GameSelected'], rawData, 'TopJobCompletionDestinations');
      }
      return this.viz_model;
   }
}