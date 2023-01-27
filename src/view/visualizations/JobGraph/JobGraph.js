// global imports
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
// local imports
import { useD3 } from "../../../controller/hooks/useD3";
import { JobGraphModel } from "../../../model/visualizations/JobGraphModel";
import PlayersList from "./PlayersList";
import ForceGraph from './forceGraph'
import JobGraphLegend from "./JobGraphLegend";
import { Visualizers } from "../../../model/enums/Visualizers";

/**
 * @typedef {import("../../../model/visualizations/VisualizerModel").default} VisualizerModel
 * @typedef {import("../../../typedefs").JobGraphSetter} JobGraphSetter
 * @typedef {import("../../../typedefs").StringSetter} StringSetter
 * @typedef {import("../../../typedefs").StringListSetter} StringListSetter
 * @typedef {import("../../../typedefs").SetterCallback} SetterCallback
 */

/**
 * force directed graph component for job/mission level data
 * @param {object} props raw data JSON object 
 * @param {VisualizerModel} props.model
 * @param {SetterCallback} props.setVisualizer
 * @returns 
 */
export default function JobGraph({ model, setVisualizer }) {
    /** @type {[VisualizerModel, JobGraphSetter]} data */
    const [localModel, setLocalModel] = useState(model);
    /** @type {[string, StringSetter]} data */
    const [linkMode, setLinkMode] = useState('TopJobCompletionDestinations')
    /** @type {[string[] | undefined, StringListSetter]} data */
    const [playersList, setPlayerList] = useState()
    const [playerHighlight, setHighlight] = useState()

    const updateLinkMode = (value) => {
        setLinkMode(value);
        setLocalModel(new JobGraphModel(localModel.Game, localModel.Data, linkMode))
        setPlayerList(null)
    }

    // useEffect(() => {
    //     console.log(data)
    // }, [data])

    /* manipulate raw data to a format to be used by the vis views */

    const showPlayersList = (link) => {
        let players, title
        if (linkMode === 'ActiveJobs') {
            players = localModel.nodes.find(n => n.id === link.id).players
            title = `${link.id} (${players.length} in progress)`
        }
        else {
            players = localModel.links.find(l => l.source === link.source.id && l.target === link.target.id).players
            title = `${link.source.id}\n` + `➔ ${link.target.id}\n` +
                `(${players.length} ${linkMode === 'TopJobSwitchDestinations' ? 'switched' : 'completed'})`          
        }
        setPlayerList({ players, title })
    }

    /**
    * redirect function
    * this function is passed to PlayersList
    * when user selects a player/session, they will be taken to that player/session's timeline
    */
    const toPlayerTimeline = () => {
        setVisualizer(Visualizers.PLAYER_TIMELINE);
    };

    /**
     * draw the force directed graph on jobs/missions
     */
    const ref = useD3((svg) => {
        if (localModel) {
            /**
                * utility function that maps average complete time to node radius
            */
            const projectRadius = d3.scaleLinear()
                .domain([localModel.meta.minAvgTime, localModel.meta.maxAvgTime])
                .range([3, 20])

            /**
             * generates node details to be displayed when hover over a job node
             * contains game specific settings
             * @param {*} d data of a particular node (aka an element of the data obj)
             * @returns node details
             */
            const getNodeDetails = (d) => {
                const generic = `${d['JobsAttempted-num-completes']} of ${d['JobsAttempted-num-starts']} (${parseFloat(d['JobsAttempted-percent-complete']).toFixed(2)}%) players completed\n` +
                    `Average Time on Job: ${parseFloat(d['JobsAttempted-avg-time-per-attempt']).toFixed()}s\n` +
                    `Standard Deviation: ${parseFloat(d['JobsAttempted-std-dev-per-attempt']).toFixed(2)}`

                let gameSpecific = ''
                switch (localModel.Game) {
                    case 'AQUALAB':
                        gameSpecific = '\n' +
                            `Experimentation: ${d['JobsAttempted-job-difficulties'] ? d['JobsAttempted-job-difficulties'].experimentation : 'N/A'}\n` +
                            `Modeling: ${d['JobsAttempted-job-difficulties'] ? d['JobsAttempted-job-difficulties'].modeling : 'N/A'}\n` +
                            `Argumentation: ${d['JobsAttempted-job-difficulties'] ? d['JobsAttempted-job-difficulties'].argumentation : 'N/A'}`
                        break;
                    default:
                        break;
                }

                return generic + gameSpecific
            }

            const getLinkColor = (l) => {
                if (linkMode === 'ActiveJobs')
                    return "#fff0"
                if (l.players.includes(playerHighlight))
                    return 'blue'
                return "#999"
            }

            const chart = ForceGraph(localModel, {
                nodeId: d => d.id,
                nodeGroup: d => d['JobsAttempted-num-completes'] / (d['JobsAttempted-num-starts'] === '0' ? 1 : d['JobsAttempted-num-starts']),
                nodeTitle: d => d.id,
                nodeDetail: d => getNodeDetails(d),
                nodeRadius: d => projectRadius(d['JobsAttempted-avg-time-per-attempt']),
                linkStrokeWidth: l => l.value,
                linkDetail: l => `${l.value} players moved from ${l.sourceName} to ${l.targetName}`,
                linkStrength: 1,
                linkDistance: 100,
                nodeStrength: -1000,
                linkStroke: l => getLinkColor(l), // link stroke color, no color when showing jobs in progress
                outLinks: linkMode === 'ActiveJobs',
                outLinkWidth: linkMode === 'ActiveJobs' ? d => d.players.length : null,
                outLinkDetail: linkMode === 'ActiveJobs' ? d => `${d.players.length} players in progress` : null,
                parent: svg,
                nodeClick: ''
            },
                showPlayersList
            )
        }
    }, [localModel, playerHighlight]) // dependency -> data: change in linkMode will trigger data recalculation (@useEffect)

    // render component
    if (model instanceof JobGraphModel) {
        return (
            <>
                <svg ref={ref} className="w-full border-b" />

                {playersList ?
                    <PlayersList
                        data={playersList}
                        playerSummary={localModel.meta.playerSummary}
                        redirect={toPlayerTimeline}
                        playerHighlight={playerHighlight}
                        setHighlight={setHighlight}
                        setPlayerList={setPlayerList}
                    /> :
                    <></>
                }

                {/* bottom right section: path type and player count */}
                <div className="fixed bottom-3 right-3 font-light text-sm">

                    {/* path type 3-way selection */}
                    <fieldset className="block">
                        <legend >Show paths of players who</legend>
                        <div className="mt-2">
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        className="form-radio"
                                        type="radio"
                                        name="radio-direct"
                                        checked={linkMode === 'TopJobCompletionDestinations'}
                                        onChange={(e) => { updateLinkMode(e.currentTarget.value) }}
                                        value="TopJobCompletionDestinations" />
                                    <span className="ml-2">finished the job</span>
                                </label>
                            </div>
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        className="form-radio"
                                        type="radio"
                                        name="radio-direct"
                                        checked={linkMode === 'TopJobSwitchDestinations'}
                                        onChange={(e) => { updateLinkMode(e.currentTarget.value) }}
                                        value="TopJobSwitchDestinations" />
                                    <span className="ml-2">left the job</span>
                                </label>
                            </div>
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        className="form-radio"
                                        type="radio"
                                        name="radio-direct"
                                        checked={linkMode === 'ActiveJobs'}
                                        onChange={(e) => { updateLinkMode(e.currentTarget.value) }}
                                        value="ActiveJobs" />
                                    <span className="ml-2">still in progress</span>
                                </label>
                            </div>
                        </div>
                    </fieldset>

                    {/* <p className="mt-2">Player Count: {data && data.meta.PlayerCount} </p> */}

                </div>

                {/* bottom left section: chart legend */}
                {localModel && <JobGraphLegend populationSummary={localModel.meta.populationSummary} />}
            </>
        )
    }
    else {
        return <div>Wrong kind of VisualizerModel for JobGraph</div>
    }

}