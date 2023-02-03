// global imports
import React from 'react';
import { AdjustmentsVerticalIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
// local imports
import LargeButton from '../../components/buttons/LargeButton';
import RangePicker from '../../components/RangePicker';
import EnumPicker from '../../components/EnumPicker';
//    model imports
import { InputModes, ValueModes } from '../../controller/requests/FilterRequest';

/**
 * @typedef {import("../../typedefs").MapSetter} MapSetter
 * @typedef {import("../../typedefs").SetterCallback} SetterCallback
 * @typedef {import("../../controller/requests/FilterRequest").FilterRequest} FilterRequest
 * @typedef {import("../../controller/requests/FilterRequest").FilterItem} FilterItem
 */

 /**
 * @param {object} props
 * @param {FilterRequest} props.filterRequest
 * @param {boolean}       props.loading
 * @param {MapSetter}     props.mergeContainerState
 * @param {function}      props.updateData
 */
export default function DataFilter({ filterRequest, loading, mergeContainerState, updateData }) {
   // TODO: in theory, would be more user-friendly if pressing "X" button canceled changes to filter,
   // and then pressing visualize would end adjust mode and run the selected filter

   const [localState, setLocalState] = useState({});

   // adjustMode indicates whether the filtering box is expanded to make selections, or not.
   const [adjustMode, setAdjustMode] = useState(false);
   const updateAdjustMode = (in_adjust_mode) => {
      // If we're turning adjust mode off, then we should update whoever requested a data filter.
      if (!in_adjust_mode) {
         console.log(`In DataFilter, adjustMode changed, updating requester's state to ${JSON.stringify(localState)}...`)
         mergeContainerState(localState)
      }
      setAdjustMode(in_adjust_mode);
   }

   /* Follow dumb-looking approach from react docs for doing something when a prop changes,
   by keeping previous value as a state variable. Seems hacky and dumb, but whatever.
   If loading changes to false, we are not adjusting and should return to false (resetting selections/filters) */
   const [wasLoading, setWasLoading] = useState(loading);
   if (loading !== wasLoading) {
      if (!loading) {
         setAdjustMode(false);
      }
      setWasLoading(loading);
   }

   /**
    * 
    * @param {FilterItem} item 
    */
   const RenderRange = (item) => {
      const key = `${item.Name}Range`;
      return (
         <div id={key}>
            <RangePicker
               adjustMode={adjustMode}
               filterItem={item}
               mergeContainerState={mergeContainerState}
               key={key}
            />
         </div>
      )
   }

   /**
    * 
    * @param {FilterItem} item 
    */
   const RenderDropdown = (item) => {
      const key = `${item.Name}Dropdown`
      switch (item.ValueMode) {
         case ValueModes.ENUM:
            return (
               <EnumPicker
                  adjustMode={adjustMode}
                  filterItem={item}
                  mergeContainerState={mergeContainerState}
                  key={key}
               />
            )
         break;
         case ValueModes.DATE:
         case ValueModes.NUMBER:
         case ValueModes.TEXT:
         case ValueModes.TIME:
         default:
            return (<div>Value Mode not supported for Dropdown: {item.ValueMode.asString}</div>)
         break;
      }
   }

   /**
    * 
    * @param {FilterItem} item 
    */
   const RenderInput = (item) => {
      const key = `${item.Name}Input`;
      switch (item.ValueMode) {
         case ValueModes.ENUM:
         case ValueModes.DATE:
         case ValueModes.NUMBER:
         case ValueModes.TEXT:
         case ValueModes.TIME:
         default:
            return (<div key={key}>Value Mode not supported for Input: {item.ValueMode.asString}</div>)
         break;
      }
   }

   /**
    * 
    * @param {FilterItem} item 
    */
   const RenderItem = (item) => {
      switch (item.InputMode) {
         case InputModes.DROPDOWN:
            return RenderDropdown(item);
         break;
         case InputModes.INPUT:
            return RenderInput(item);
         break;
         case InputModes.RANGE:
            return RenderRange(item)
         break;
         case InputModes.SEPARATOR:
            return ( <hr style={{margin: "10px 0px"}}/> )
         break;
         default:
            const key = `${item.Name}Invalid`;
            return ( <div key={key}>Invalid Input Mode: {item.InputMode.asString}</div> );
         break;
      }
   }


   const filterElements = filterRequest.Items.map(
      (item) => RenderItem(item)
   )

   const renderToggleButton = () => {
      if (adjustMode) {
         if (!loading) {
            // If in adjustment mode, and not currently loading, then we'll have expanded view so show an X.
            return (<XMarkIcon className="cursor-pointer h-5 w-5" onClick={() => updateAdjustMode(false)} />);
         }
         else {
            return (<></>);
         }
      }
      else {
         // If not in adjustment mode, show "adjustments" button to expand the filter.
         return (<AdjustmentsVerticalIcon className="cursor-pointer h-5 w-5" onClick={() => updateAdjustMode(true)} />);
      }
   }

   // console.log(`In DataFilter, just before returning, viewMode is ${viewMode.asString}`)
   return (
      <div className='bg-white border shadow-sm px-4'>
         <div className='flex justify-between mb-2'>
            { renderToggleButton() }
         </div>
         {filterElements}
         <div className='flex space-x-2 items-center'>
            {loading ?
               <><Cog6ToothIcon className='animate-spin h-2 w-2' /> &nbsp;Please wait...</>
               :
               adjustMode ? 
               <LargeButton label='save' onClick={(e) => {updateAdjustMode(false)}} selected="false"/>
               :
               <LargeButton label='visualize' onClick={updateData} selected="false"/>
            }
         </div>
      </div>
   )
}
