// Load the JSON data
d3.json('work.json').then(data => {
    // 'data' contains the contents of your JSON file
    // console.log(data); // Log to see the data structure

    // Your D3 code to create the graph goes here
    // For example, you might use data.nodes and data.links
    
    const allNodes = data.nodes;
    const allLinks = data.links; // Ensure 'links' is accessed from 'data'

    console.log("All Nodes:", allNodes);
    console.log("All Links:", allLinks);


    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // ... Initialize your SVG or canvas ...

    const simulation = d3
        .forceSimulation(allNodes)
        .force(
            "link",
            d3.forceLink(allLinks).id((d) => d.id).distance(100).strength(0.1)
        )
        .force("charge", d3.forceManyBody())
        //Centering force
        // .force("center", d3.forceCenter(width / 2, height / 2));
        //Positioning force
        .force("x", d3.forceX())
        .force("y", d3.forceY());


    const svg = d3.select("#graph")
    width = +svg.attr("width"),
        height = +svg.attr("height");

    svg.attr("viewBox", [-width / 2, -height / 2, width, height])
    svg.attr("style", "max-width: 100%; height: auto;");


    const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(allLinks)
        .enter()
        .append("line")
        .join("line")
        // .attr("stroke-width", d => Math.sqrt(d.value));
        .attr("stroke-width", 10);

    const node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(allNodes)
        .enter()
        .append("circle")
        // .attr("r", 10)
        // .attr("fill", (d) => d.group === undefined ? "#E519E5" : "#1f77b4")
        .attr("class", d => d.type.includes('center') ? "node center-node" : "node")
        .call(
            d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
        );


    // Create the force simulation using 'data.nodes' and 'data.links'
    // const simulation = d3.forceSimulation(data.nodes)
    //     .force("link", d3.forceLink(data.links).id(d => d.id))
    // ... Other forces as needed ...
    simulation.on("tick", () => {
        link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        // console.log("here")
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event, d) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }


// Create tooltips
node.append("title").text((d) => d.id);


// Or for custom tooltip divs
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
node
  .on("mouseover", function (event, d) {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .html(d.id)
      .style("left", event.pageX + "px")
      .style("top", event.pageY - 28 + "px");
  })
  .on("mouseout", function (d) {
    tooltip.transition().duration(500).style("opacity", 0);
  });

    // Create nodes and links...
    // ...

    // Handling the simulation "tick" event to update node and link positions
    // ...

}).catch(error => {
    console.error("Error loading the JSON data: ", error);
});














// async function loadAndProcessData() {
//     try {
//         const data = await d3.json('work.json');
//         console.log(data);
//         // Rest of your D3 code
//     } catch (error) {
//         console.error("Error loading the JSON data: ", error);
//     }
// }

// loadAndProcessData();
