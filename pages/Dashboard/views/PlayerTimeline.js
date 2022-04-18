import * as d3 from "d3";
import { useState, useEffect } from 'react';
import LargeButton from "../../../components/buttons/LargeButton";
import { useD3 } from "../../../hooks/useD3";


export default function PlayerTimeline({ rawData, updateViewMetrics }) {

    const [eventTypesDisplayed, setEventTypesDisplayed] = useState(null)
    const [data, setData] = useState(convert(rawData))
    // const data = convert(rawData)

    // register types of events found for this user
    useEffect(() => {
        setEventTypesDisplayed(data.meta.types)
    }, [])

    // re-filter data when user changes the event types to be displayed
    useEffect(() => {
        if (eventTypesDisplayed instanceof Set)
            setData(filter(convert(rawData), eventTypesDisplayed))
    }, [eventTypesDisplayed])


    /**
     * draw the timeline
     */
    const diagram = useD3((svg) => {
        const width = window.innerWidth
        const height = window.innerHeight
        const dotSize = 20

        // scale according to shortest duration (so that its length stays at 100)
        const sacleFactorY = 50 / (data.meta.minDuration)

        const color = d3.scaleOrdinal(data.meta.types, d3.schemeTableau10)

        svg.attr("viewBox", [-width / 20, -height / 2, width, height])
        svg.selectAll('*').remove();

        // baseline
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', (data.meta.totalTime) * sacleFactorY)
            .attr('stroke', 'grey')
            .attr('stroke-width', dotSize / 5)

        // wrapper for event representations
        const sequence = svg
            .append('g')
            .classed('wrapper', true)

        // event representation
        const event = sequence
            .selectAll('g')
            .data(data.events)
            .join('g')
            .classed('event', true)
            .attr('transform', ({ timestamp }, i) => `translate(${sacleFactorY * timestamp})`)
            .on('mouseover', function handleHover(e, d) {
                d3.select(this).select('circle')
                    // .transition()
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)

                // attach event details
                d3.select(this)
                    .selectAll('.details')
                    .data(d => d.extra) // replace with dynamic data
                    .join('text')
                    .classed('details', true)
                    .text(d => d)
                    .attr('dy', (d, i) => `${i * 1.3}em`)
                    .attr('transform', `translate(${-dotSize},${3 * dotSize})`)
                    .attr('font-size', dotSize)
            })
            .on('mouseout', function handleUnhover(e, d) {
                d3.select(this).select('circle')
                    // .transition()
                    .attr('stroke-width', 0)

                d3.select(this).selectAll('.details').remove()
            })

        // draw node
        event.append('circle')
            .attr('r', dotSize)
            .attr('fill', ({ type }) => color(type))

        // event name
        event.append('text')
            .classed('title', true)
            .text(({ name, type }) => `${type} @ ${name}`) // replace with dynamic data
            .attr('transform', `rotate(-45) translate(${dotSize * 1.5})`)
            .attr('font-size', dotSize)

        // event duration
        event.append('text')
            .classed('duration', true)
            .text(({ duration }) => `${duration}s`) // replace with dynamic data
            .attr('transform', ({ duration }) => `translate(${duration * sacleFactorY / 2 - dotSize / 2},${dotSize * 1.5})`)
            .attr('font-size', dotSize)

        // zoom behavior
        function handleZoom(e) {
            // pan behavior
            d3.select('.wrapper')
                // .attr('transform', `translate(${e.transform.x}) scale(${e.transform.k})`);
                .attr('transform', `translate(${e.transform.x})`)

            // zoom
            d3.selectAll('.event')
                .filter(function () { return !this.classList.contains('duration') })
                .attr('transform', ({ timestamp }, i) => `translate(${sacleFactorY * timestamp * e.transform.k})`)
            d3.selectAll('.duration')
                .attr('transform', ({ duration }) => `translate(${(duration * sacleFactorY / 2 - dotSize / 2) * e.transform.k},${dotSize * 1.5})`)
            d3.select('svg line')
                .attr('transform', `translate(${e.transform.x}) scale(${e.transform.k} 1)`);
        }
        let zoom = d3.zoom()
            .on('zoom', handleZoom);
        svg
            .call(zoom);

    }, [data])

    /**
     * genrates the options (radio buttons) for the event type filter
     */
    const filterControl = () => {
        const listOfEvents = [...data.meta.types].map((e) => (
            <div key={e}>
                <label>
                    <input
                        className="form-checkbox"
                        type="checkbox"
                        checked={eventTypesDisplayed.has(e)}
                        onChange={() => {
                            if (eventTypesDisplayed.has(e) && eventTypesDisplayed.size > 1) setEventTypesDisplayed(new Set([...eventTypesDisplayed].filter(d => d !== e)))
                            else {
                                const newList = [...eventTypesDisplayed]
                                newList.push(e)
                                setEventTypesDisplayed(new Set(newList))
                            }
                        }}
                    />
                    <span> {e}</span>
                </label>
            </div>
        ))
        return listOfEvents
    }

    return (
        <>
            {rawData && <>
                <svg
                    ref={diagram}
                    className="w-full mx-0"
                />
                <div className="fixed bottom-5 left-8">
                    <LargeButton
                        selected={false}
                        onClick={() => { updateViewMetrics('JobGraph') }}
                        label='← BACK TO JOB GRAPH'
                    />
                    <p className='mb-3 text-4xl font-light'>Player {data.meta.playerID}</p>
                    <p className="font-light">
                        From <span className="font-bold">{data.meta.startTime}</span> to <span className="font-bold">{data.meta.endTime}</span>
                    </p>
                    <p className="font-light">
                        Total time taken: <span className="font-bold">{data.meta.totalTime}s</span>
                    </p>
                    <p className="font-light">
                        Session count: <span className="font-bold">{data.meta.sessionCount}</span>
                    </p>
                </div>

                <fieldset className="fixed bottom-5 right-8 font-light">
                    <legend className="">Show event types of:</legend>
                    <div className="mt-2">
                        {eventTypesDisplayed instanceof Set && filterControl()}
                    </div>
                </fieldset>
            </>}
        </>
    )
}

/**
 * converts raw data from the server to a chart-understandable format
 * @param {*} rawData 
 * @returns converted data
 */
function convert(rawData) {
    const rawEvents = JSON.parse(rawData.vals[0])

    console.log(rawData)
    // console.log(rawEvents)

    // extract primary values
    const meta = {
        playerID: rawEvents[0].user_id,
        sessionCount: rawData.vals[1]
    }
    const events = rawEvents.map((e) => {
        // console.log(e)
        return {
            name: e.job_name,
            type: e.name,
            timestamp: ((new Date(e.timestamp)).getTime() / 1000).toFixed(0),
            date: (new Date(e.timestamp)).toLocaleString(),
            sessionID: e.session_id
        }
    })


    // calculate derived values
    const startTime = events[0].timestamp
    let minDuration = Infinity
    // let minDuration = 1000000
    const typeList = new Set()
    for (let i = 0; i < events.length; i++) {

        // calculate duration
        let duration = 0
        if (i < events.length - 1) duration = events[i + 1].timestamp - events[i].timestamp
        events[i].duration = duration
        if (duration > 0 && duration < minDuration) minDuration = duration // update minimum duration

        // normalize timestamps
        events[i].timestamp = events[i].timestamp - startTime

        // construct list of types
        typeList.add(events[i].type)

        // lump extra features to one field
        let extra = []
        for (const [k, v] of Object.entries(rawEvents[i])) {
            if (!['job_name', 'name', 'timestamp', 'user_id'].includes(k))
                extra.push(`${k}: ${v}`)
        }
        events[i].extra = extra
    }

    meta.minDuration = minDuration
    meta.startTime = events[0].date
    meta.endTime = events[events.length - 1].date
    meta.totalTime = events[events.length - 1].timestamp - events[0].timestamp
    meta.types = typeList

    console.log(meta, events)

    return { meta, events }
}

/**
 * filter events by event type
 * @param {*} data 
 * @param {*} filterParams list of event types to be included
 * @returns filtered data
 */
function filter(data, filterParams) {

    // select objects of specified event type
    const filteredEvents = data.events.filter(({ type }) => filterParams.has(type))


    let minDuration = Infinity
    // let minDuration = 1000000
    // recalculate time elapsed in between filtered events
    for (let i = 0; i < filteredEvents.length - 1; i++) {
        const e = filteredEvents[i];

        const d = filteredEvents[i + 1].timestamp - e.timestamp
        if (d > 0 && d < minDuration) minDuration = d
        e.duration = d
    }
    // recalculate min duration
    data.meta.minDuration = minDuration


    data.events = filteredEvents
    return data
}