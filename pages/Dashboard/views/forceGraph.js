import * as d3 from 'd3'

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// modified from https://observablehq.com/@d3/force-directed-graph
function ForceGraph({
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
}, {
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeDetails,
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 2, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkTitle,
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    linkDistance,
    colors = d3.interpolateRdYlGn, // an array of color values, for the node groups
    width = 800, // outer width, in pixels
    height = 450, // outer height, in pixels
    invalidation, // when this promise resolves, stop the simulation
    parent,

} = {}) {
    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    if (nodeDetails === undefined) nodeDetails = (_, i) => N[i];
    const D = nodeDetails == null ? null : d3.map(nodes, nodeDetails);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    if (!nodeRadius) nodeRadius = (_, i) => N[i]
    const R = nodeRadius == null ? null : d3.map(nodes, nodeRadius)

    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
    if (linkTitle === undefined) linkTitle = (_, i) => LS[i];
    const TP = linkTitle == null ? null : d3.map(links, linkTitle) // tooltips


    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
    links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    // const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
    const color = nodeGroup == null ? null : d3.scaleSequential(colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength).distance(10);
    if (linkDistance !== undefined) forceLink.distance(linkDistance);


    const svg = parent
        .attr("viewBox", [-width / 2, -height / 2, width, height])
    // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    svg.selectAll('*').remove();

    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 40)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#888')
        .style('stroke', 'none');

    const link = svg.append("g")
        .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-linecap", linkStrokeLinecap)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr('marker-end', 'url(#arrowhead)')
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center", d3.forceCenter())
        .on("tick", ticked);

    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .call(drag(simulation));

    const text = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .text(({ index: i }) => T[i])
        .attr('font-size', 8)
        .attr('stroke', 'white')
        .attr('stroke-width', .2)
        .attr('fill', 'black');
    // .attr('user-select', 'none')


    // console.log(node.attr('r', (i) => { console.log(i) }))
    console.log(R)
    if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
    if (L) link.attr("stroke", ({ index: i }) => L[i]);
    if (TP) link.append('title').text(({ index: i }) => TP[i]);
    if (G) node.attr("fill", ({ index: i }) => color(G[i]));
    if (R) node.attr('r', ({ index: i }) => R[i]);
    if (T) node.append("title").text(({ index: i }) => D[i]);
    if (invalidation != null) invalidation.then(() => simulation.stop());

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", ({ index: i, x: x }) => x + R[i] + 3)
            .attr("y", d => d.y);
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    function handleZoom(e) {
        // apply transform to the chart

        text.attr('transform', e.transform);
        node.attr('transform', e.transform);
        link.attr('transform', e.transform);
    }

    let zoom = d3.zoom()
        .on('zoom', handleZoom);

    svg.call(zoom);

    return Object.assign(svg.node(), { scales: { color } });
}

export default ForceGraph