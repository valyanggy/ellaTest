let allNodes = [];
let allLinks = [];
const customTitleIndex = { index: 0 }; // Object to keep track of the index

const xOffset = 5; // Horizontal offset for each new bow knot
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


// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

//create nodes and links function:
function createBowKnot(centerX, centerY, groupId, customTitleIndex, customTitles) {
  const nodes = [];
  const links = [];
  // let customIdIndex = 0;


  function getNextTitle() {
    if (customTitleIndex.index < customTitles.length) {
      return customTitles[customTitleIndex.index++];
    } else {
      return `Default Title ${groupId}`;
    }
  }

  // // Add left and right loops
  // const loopNodeCount = 7;
  // for (let side of ["left", "right"]) {
  //   for (let i = 1; i <= loopNodeCount; i++) {
  //     const nodeId = `${side}${i}`;
  //     nodes.push({ id: nodeId }); // x, y positions can be adjusted as needed
  //     if (i === 1) {
  //       links.push({ source: "center", target: nodeId });
  //     } else {
  //       links.push({ source: `${side}${i - 1}`, target: nodeId });
  //     }
  //     if (i === loopNodeCount) {
  //       links.push({ source: nodeId, target: "center" }); // Close the loop
  //     }
  //   }
  // }

  // // Add left and right tails
  // const tailNodeCount = 4;
  // for (let side of ["left", "right"]) {
  //   for (let i = 1; i <= tailNodeCount; i++) {
  //     const nodeId = `${side}Tail${i}`;
  //     nodes.push({ id: nodeId }); // x, y positions can be adjusted as needed
  //     if (i === 1) {
  //       links.push({ source: "center", target: nodeId });
  //     } else {
  //       links.push({ source: `${side}Tail${i - 1}`, target: nodeId });
  //     }
  //   }
  // }

  // Adjust the ID assignment for loops and tails
  const sections = ['left', 'right'];
  const loopNodeCount = 7;
  sections.forEach(side => {
    for (let i = 1; i <= loopNodeCount; i++) { // For loops
      const nodeId = `${side}${i}_${groupId}`;
      nodes.push({ id: nodeId, group: groupId, title: getNextTitle() });

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
      nodes.push({ id: nodeId, group: groupId,title: getNextTitle() });

      if (i === 1) {
        links.push({ source: `center_${groupId}`, target: nodeId });
      } else {
        links.push({ source: `${side}Tail${i - 1}_${groupId}`, target: nodeId });
      }
    }
  });

  // Add center node
  nodes.push({ id: `center_${groupId}`, x: centerX, y: centerY, group: groupId, title: getNextTitle() });
  // nodes.push({ id: `center_${groupId}`, group: groupId });
  // nodes.push({ id: getNextId('center'), group: groupId });





  return { nodes, links };
}


//create knots:
for (let i = 0; i < numberOfKnots; i++) {
  let centerX = initialX + i * xOffset;
  let centerY = initialY;
  let groupId = i;
  let bowKnot = createBowKnot(centerX, centerY, groupId, customTitleIndex, customTitles);

  allNodes = allNodes.concat(bowKnot.nodes);
  allLinks = allLinks.concat(bowKnot.links);
}


function createSunflower(centerX, centerY, groupId, customTitleIndex, customTitles) {
  const nodes = [];
  const links = [];
  
  // Function to get the next title for the tooltip
  function getNextTitle() {
      return customTitles[customTitleIndex.index++];
  }

  // Create the center node
  nodes.push({ id: `centerNode_${groupId}`, group: groupId, title: getNextTitle() });

  // Create surrounding nodes and link them to the center
  const numPetals = 6; // Total number of surrounding nodes
  for (let i = 1; i <= numPetals; i++) {
      const nodeId = `node${i}_${groupId}`;
      nodes.push({ id: nodeId, group: groupId, title: getNextTitle() });
      links.push({ source: `centerNode_${groupId}`, target: nodeId });
  }

  return { nodes, links };
}

for (let i = 0; i < numberOfStructures; i++) {
  let centerX = initialX + i * xOffset;
  let centerY = initialY;
  let groupId = i;
  let sunflower = createSunflower(centerX, centerY, groupId, customTitleIndex, customTitles);

  allNodes = allNodes.concat(sunflower.nodes);
  allLinks = allLinks.concat(sunflower.links);
}




// console.log("All Nodes:", allNodes);
// console.log("All Links:", allLinks);














const simulation = d3
  .forceSimulation(allNodes)
  .force(
    "link",
    d3.forceLink(allLinks).id((d) => d.id).distance(10).strength(0.9)
  )
  .force("charge", d3.forceManyBody())
  //Centering force
  // .force("center", d3.forceCenter(width / 2, height / 2));
  //Positioning force
  .force("x", d3.forceX())
  .force("y", d3.forceY(.5));

const collisionForce = d3.forceCollide().radius(d => d.radius + 100); // Adjust the radius sum
simulation.force("collide", collisionForce);

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
node.append("title").text((d) => d.title);


// Or for custom tooltip divs
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

node
  .on("mouseover", function (event, d) {
    const tooltipDiv = d3.select("#tooltip");
    const projectInfo = d3.select("#project-info");

    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(d.title)
      .style("left", event.pageX + "px")
      .style("top", event.pageY - 48 + "px");


    // tooltipDiv.classed("center-node", d.id.includes('center')); // Apply class based on condition
    // tooltipDiv.style("opacity", 1)
    //   .html(d.title)



  })
  .on("mouseout", function (d) {
    tooltip.transition().duration(500).style("opacity", 0);
  });


invalidation.then(() => simulation.stop());