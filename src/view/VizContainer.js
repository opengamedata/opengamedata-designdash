// global imports
import { React, useState, useEffect, alert, useReducer } from 'react';
// local imports
import { vis_games } from '../config';
import LargeButton from '../components/buttons/LargeButton';
import LoadingBlur from '../components/LoadingBlur';

// model imports
import { ViewModes } from '../model/ViewModes';
import { InitialVisualizerModel } from '../model/visualizations/InitialVisualizerModel'
import { JobGraphModel } from '../model/visualizations/JobGraphModel';
import { PlayerTimelineModel } from '../model/visualizations/PlayerTimelineModel';
import { OGDPlayerAPI } from '../model/apis/OGDPlayerAPI';
import { OGDPopulationAPI } from '../model/apis/OGDPopulationAPI';

// controller imports
import { PopulationSelectionOptions } from '../controller/SelectionOptions';
import { FilterOptions } from '../controller/FilterOptions';

// view imports
import DataFilter from './DataFilter/DataFilter';
import InitialVisualizer from './visualizations/InitialVisualizer';
import JobVisualizer from './visualizations/JobGraph/JobVisualizer';
import PlayerVisualizer from './visualizations/PlayerTimeline/PlayerVisualizer';

/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function VizContainer(props) {
   // whether initial form completed
   const [initialized, setInitialized] = useState(false); // in production: defalt to false 
   const [loading, setLoading] = useState(false);
   const [viewData, setViewData] = useState(null);
   const [rawData, setRawData] = useState(null);
   const [viewMode, setViewMode] = useState(ViewModes.POPULATION);
   const [filterOptions, setFilterOptions] = useState(new FilterOptions(0, null, null));
   const [vizRenderer, setVizRenderer] = useState(() => {return (<InitialVisualizer/>)})
   const [vizModel, setVizModel] = useState()
   const [selectionOptions, setSelectionOptions] = useState(
      new PopulationSelectionOptions(
         vis_games[0],
         null, null,
         null, null,
         new Date(), new Date()
      )
   );

   useEffect(() => {
      retrieveData();
   }, [selectionOptions])

   // TODO: Whenever there's a change in filtering or underlying data, refresh the view data.
   useEffect(() => {
      console.warn("Filtering of data on client side is not yet implemented!");
      setViewData(rawData);
   }, [filterOptions, rawData]);

   const updateView = () => {
      switch (viewMode) {
         case ViewModes.POPULATION:

      }
   }

   const retrieveData = () => {
        // flush current dataset and start loading animation
        setRawData(null)
        setViewData(null)
        setLoading(true)

        const localData = localStorage.getItem(selectionOptions.ToLocalStorageKey())
        // console.log(localData)
        if (localData) {
         // if query found in storage, retreive JSON
            setRawData(JSON.parse(localData)) 
            // store response to parent component state
            setInitialized(true)
            // stop loading animation
            setLoading(false)
        }
        // if not found in storage, request dataset
        else {
            console.log('fetching:', selectionOptions.ToLocalStorageKey())
            const metrics = ["Foo", "Bar"]; // TODO: figure out how to get list of metrics to load.

            let fetch_call;
            switch (viewMode) {
               case ViewModes.POPULATION:
                  fetch_call = OGDPopulationAPI.fetch;
                  break;
               case ViewModes.PLAYER:
                  fetch_call = OGDPlayerAPI.fetch;
                  break;
               case ViewModes.SESSION:
                  throw Error("Session view mode not yet supported!");
               default:
                  throw Error(`Invalid view mode ${viewMode}!`)
            }

            fetch_call(selectionOptions, metrics)
            .then(res => res.json())
            .then(data => {
               if (data.status !== 'SUCCESS') throw data.msg
               console.log(data)
               // store data locally and in the state variable
               localStorage.setItem(selectionOptions.ToLocalStorageKey(), JSON.stringify(data.val))
               setRawData(data.val)
               setInitialized(true)
               // stop loading animation
               setLoading(false)
            })
            .catch(error => {
               console.error(error)
               setLoading(false)
               alert(error)
            })
        }
   }

   const renderEmptyContainer = () => {
      return (
         
      )
   }

   const renderFilledContainer = () => {
      <>
         {/* TODO: figure out what the height and width ought to be */}
         <LoadingBlur loading={loading} height={10} width={10}/>
         {viewData &&
            {
               'JobGraph':
                  <JobVisualizer
                     rawData={viewData}
                     setViewMode={setViewMode}
                  />,
               'PlayerTimeline':
                  <PlayerVisualizer
                     rawData={viewData}
                     setViewMode={setViewMode}
                     selectedGame={selectionOptions.game_name}
                  />
            }[viewMode]
         }
      </>
   }

   return (
   <div className='w-screen'>
      {/* For DEBUG purpose, remove in production */}
      <div className='fixed top-0 right-1/2 z-10'>
         <LargeButton
            selected={false}
            label='clear cache'
            onClick={() => {
               localStorage.clear()
               alert('localStorage reset')
            }}
         />
      </div>
      <DataFilter
         loading={loading}
         viewMode={viewMode}
         containerSelection={selectionOptions}
         setContainerSelection={setSelectionOptions}
         containerFilter={filterOptions}
         setContainerFilter={setFilterOptions}
         ></DataFilter>
      { initialized ? renderFilledContainer() : renderEmptyContainer() }
   </div>

   )
}