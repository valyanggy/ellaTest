let allNodes = [];
let allLinks = [];
const customTitleIndex = { index: 0 }; // Object to keep track of the index
const nodeInfoIndex = { index: 0 }; // Object to keep track of the index

const xOffset = 5; // Horizontal offset for each new bow knot
const structureTypes = ["bowknot", "bowknot",  "bowknot", "sunflower","ops", "bowknot", "bowknot", "sunflower", "bowknot"];
const numberOfKnots = 7; // Define how many knots you want
const numberOfStructures = 2; // Define how many structures you want
const initialX = 500; // Starting X position for the first knot
const initialY = 500; // Starting Y position for all knots

//Custom titles
const customTitles = [
    'Cake_01',
    'Cake_02',
    'Cake_03',
    'Cake_04',
    'Cake_05',
    'Cake_06',
    'Cake_07',
    'Cake_08',
    'Cake_09',
    'Cake_10',
    'Cake_11',
    'Cake_12',
    'Cake_13',
    'Cake_14',
    'Cake_15',
    'Cake_16',
    'Cake_17',
    'Cake_18',
    'Cake_19',
    'Cake_20',
    'Cake',
    'ops_01',
    'ops_02',
    'ops_03',
    'ops_04',
    'ops_05',
    'ops_06',
    'ops_07',
    'ops_08',
    'ops_09',
    'ops_10',
    'ops_11',
    'ops_12',
    'ops_13',
    'ops_14',
    'ops_15',
    'ops_16',
    'ops_17',
    'ops_18',
    'ops_19',
    'ops_20',
    'Oakwood Photo Series',

]

const nodeInfo = [
    { title:"Cake_01", imageUrl:"img/IMG_7182 copy.jpg"},
    { title:"Cake_02", imageUrl:"img/0FE977DF-B77D-42DE-AE0B-8BD1672B7345_Original.jpg"},
    { title:"Cake_03", imageUrl:"img/IMG_0516.jpg"},
    { title:"Cake_04", imageUrl:"img/IMG_1314.jpg"},
    { title:"Cake_05", imageUrl:"img/IMG_2142_Original.jpg"},
    { title:"Cake_06", imageUrl:"img/IMG_3275_Original copy.jpg"},
]


function createStructure(centerX, centerY, groupId, customTitleIndex, customTitles, nodeInfoIndex, nodeInfo, structureType) {
    const nodes = [];
    const links = [];

    // Function to get the next title for the tooltip
    function getNextNodeInfo() {
        // console.log("Current Index:", nodeInfoIndex.index, "Total Length:", nodeInfo.length);
        if (nodeInfoIndex.index < nodeInfo.length) {
            // console.log("Using Node Info:", nodeInfo[nodeInfoIndex.index]);
          return nodeInfo[nodeInfoIndex.index++];
        //   console.log("Node Info:", nodeInfo);
         
        } else {
          return { title: `Default Title ${groupId}`, imageUrl: "img/ella_default.png"};
        }
      }

      function getNextTitle() {
        if (customTitleIndex.index < customTitles.length) {
            return customTitles[customTitleIndex.index++];
            // console.log("Custom Title:", customTitles);
        } else {
            return `Default Title ${groupId}`;
        }
    }

    function addNode(id, groupId, title, type) {
        nodes.push({ id: id, group: groupId, title: title, class: type });
    }


    if (structureType === 'bowknot') {
        // Logic for creating a bow knot structure
        const sections = ['left', 'right'];
        const loopNodeCount = 7;
        sections.forEach(side => {
            for (let i = 1; i <= loopNodeCount; i++) { // For loops
                const nodeId = `${side}${i}_${groupId}`;
                // const nodeImage = nodeInfo[nodeInfoIndex.index].imageUrl;
                const info = getNextNodeInfo();
                nodes.push({ id: nodeId, group: groupId, title: info.title, image: info.imageUrl });
                // console.log("Node img info:", info.imageUrl);
        
                if (i === 1) {
                    links.push({ source: `center_${groupId}`, target: nodeId });
                } else {
                    links.push({ source: `${side}${i - 1}_${groupId}`, target: nodeId });
                }

                // Close the loop
                if (i === loopNodeCount) {
                    links.push({ source: nodeId, target: `center_${groupId}` });
                }
            }
            const tailNodeCount = 3;
            for (let i = 1; i <= tailNodeCount; i++) { // For tails
                const nodeId = `${side}Tail${i}_${groupId}`;
                const info = getNextNodeInfo();

        
                nodes.push({ id: nodeId, group: groupId, title: info.title, image: info.imageUrl });

                if (i === 1) {
                    links.push({ source: `center_${groupId}`, target: nodeId });
                } else {
                    links.push({ source: `${side}Tail${i - 1}_${groupId}`, target: nodeId });
                }
            }
        });

    } else if (structureType === 'sunflower') {
        // Logic for creating a sunflower structure
        const numPetals = 6;
        for (let i = 1; i <= numPetals; i++) {
            const nodeId = `node${i}_${groupId}`;
            const info = getNextNodeInfo();
            nodes.push({ id: nodeId, group: groupId, title: info.title, image: info.imageUrl});
            links.push({ source: `center_${groupId}`, target: nodeId });
        }
    } else if (structureType === 'ops') {
        // Logic for creating a line structure
        const numNodesInLine = 4;
        for (let i = 1; i <= numNodesInLine; i++) {
            const nodeId = `node${i}_${groupId}`;
            const info = getNextNodeInfo();
            nodes.push({ id: nodeId, group: groupId, title: info.title, image: info.imageUrl });
            // addNode(nodeId, groupId, getNextTitle(), 'ops');
            if (i > 1) {
                links.push({ source: `node${i - 1}_${groupId}`, target: nodeId });
            }
        }
    }

    // Common center node for both structures
    const info = getNextNodeInfo();
    nodes.push({ id: `center_${groupId}`, group: groupId, title: info.title, image: info.imageUrl});


    return { nodes, links };
}


// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

for (let i = 0; i < structureTypes.length; i++) {
    let centerX = initialX + i * xOffset;
    let centerY = initialY;
    let groupId = i;
    let structureType = structureTypes[i]; // Use the structure type from the array
    let structure = createStructure(centerX, centerY, groupId, customTitleIndex, customTitles, nodeInfoIndex, nodeInfo, structureType);

    allNodes = allNodes.concat(structure.nodes);
    allLinks = allLinks.concat(structure.links);
}



console.log("All Nodes:", allNodes);
console.log("All Links:", allLinks);





const simulation = d3
    .forceSimulation(allNodes)
    .force(
        "link",
        d3.forceLink(allLinks).id((d) => d.id).distance(5).strength(0.7)
    )
    .force("charge", d3.forceManyBody().strength(-90))
    //Centering force
    // .force("center", d3.forceCenter(width / 2, height / 2));
    //Positioning force
    .force("x", d3.forceX(10))
    .force("y", d3.forceY(1));

//     const chargeForce = d3.forceManyBody()
//     .strength(-500);  // A more negative value increases repulsion



// const collisionForce = d3.forceCollide().radius(d => d.radius + 1000); // Adjust the radius sum
// simulation.force("collide", collisionForce);

// function groupSeparation(alpha) {
//     allNodes.forEach(d => {
//         // This is an example. Adjust according to your structure's layout logic.
//         if (d.group === specificGroup) {
//             d.vx += alpha * 1; // Push nodes horizontally
//             d.vy += alpha * 1.2; // Push nodes vertically
//         }
//     });
// }

// simulation.force("groupSeparation", groupSeparation);


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
    .attr("class", d => d.id.includes('center') ? `node center-node group-${d.group}` : `node group-${d.group}`)
    .call(
        d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    );

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
// node.append("title").text((d) => d.title);

let tooltipTimeout, hideTooltipTimeout;

// Or for custom tooltip divs
const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

node
    .on("mouseover", function (event, d) {
        // const tooltipDiv = d3.select("#tooltip");
        // const projectInfo = d3.select("#project-info");

        // clearTimeout(hideTooltipTimeout);
        // showTooltipTimeout = setTimeout(() => {
        //     tooltip.transition().duration(200).style("opacity", 0);
        //     tooltip
        //     .html(`<strong>${d.title}</strong><br><img src='${d.image}' alt='Image'>`)
        //     .style("left", event.pageX + "px")
        //     .style("top", event.pageY - 48 + "px")
        //       .style("opacity", 1);
        // }, 200);    

        // tooltip.transition().duration(200).style("opacity", 1);
        // tooltip
        //     .html(`<strong>${d.title}</strong><br><img src='${d.image}' alt='Image'>`)
        //     .style("left", event.pageX + "px")
        //     .style("top", event.pageY - 200 + "px")
        //       .style("opacity", 1);

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
            .html(`<strong>${d.title}</strong><br><img src='${d.image}' alt='Image'>`)
            .style("position", "absolute")
            .style("left", 0 + "px")
            .style("top", 0 + "px")
            .style("width", window.innerWidth+ "px")
            .style("height", window.innerHeight  + "px")
              .style("opacity", 1);





    })
    .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
    });


invalidation.then(() => simulation.stop());