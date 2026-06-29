import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ABOUT_FORCE_TRANSITION } from "../about/aboutAnimation";
import { ABOUT_NODE_SCALE, GROUP_COLORS } from "../config/site";
import { projectMatchesCategory } from "../content/filtering";
import {
  applyBouquetForceSettings,
  forceAboutSpace,
  getBouquetForceSettings,
  interpolateBouquetForceSettings
} from "./forces";
import { useProjectGraph } from "./graphData";

const ABOUT_HIT_RADIUS_SCALE = 1.8;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_VIEWPORT_GUTTER = 16;

function getVisibleGroups(nodes, activeCategory) {
  if (!activeCategory) {
    return null;
  }

  return new Set(
    nodes.filter((node) => node.category === activeCategory || projectMatchesCategory(node.project || {}, activeCategory)).map((node) => node.group)
  );
}

function isNodeVisible(data, visibleGroups) {
  return !visibleGroups || visibleGroups.has(data.group);
}

function isLinkVisible(data, visibleGroups) {
  return isNodeVisible(data.source, visibleGroups) && isNodeVisible(data.target, visibleGroups);
}

function getNodeRadius(data, radius, aboutOpen) {
  const defaultRadius = data.center ? radius * 1.07 : radius;
  return aboutOpen ? defaultRadius * ABOUT_NODE_SCALE : defaultRadius;
}

function getHitRadius(data, radius, aboutOpen) {
  const defaultRadius = data.center ? radius * 1.14 : radius;
  return aboutOpen ? defaultRadius * ABOUT_HIT_RADIUS_SCALE : defaultRadius;
}

function getTooltipHtml(data) {
  if (data.placeholder) {
    return `<strong>${data.title}</strong>`;
  }

  const image = data.imageUrl ? `<img src="${data.imageUrl}" alt="">` : "";
  const mediaLabel = data.mediaIndex ? `IMG_${String(data.mediaIndex).padStart(4, "0")}` : "";
  const title = [mediaLabel, data.imageTitle].filter(Boolean).join(" ");
  return `<strong>${data.title}</strong><span>${title}</span>${image}`;
}

function positionTooltip(event, tooltip) {
  const tooltipElement = tooltip.node();

  if (!tooltipElement) {
    return;
  }

  const rect = tooltipElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let left = event.clientX + TOOLTIP_OFFSET;
  let top = event.clientY + TOOLTIP_OFFSET;

  if (left + rect.width + TOOLTIP_VIEWPORT_GUTTER > viewportWidth) {
    left = event.clientX - rect.width - TOOLTIP_OFFSET;
  }

  if (top + rect.height + TOOLTIP_VIEWPORT_GUTTER > viewportHeight) {
    top = event.clientY - rect.height - TOOLTIP_OFFSET;
  }

  left = Math.max(TOOLTIP_VIEWPORT_GUTTER, Math.min(left, viewportWidth - rect.width - TOOLTIP_VIEWPORT_GUTTER));
  top = Math.max(TOOLTIP_VIEWPORT_GUTTER, Math.min(top, viewportHeight - rect.height - TOOLTIP_VIEWPORT_GUTTER));

  tooltip.style("left", `${left}px`).style("top", `${top}px`);
}

function showTooltip(event, tooltip, data) {
  tooltip
    .style("opacity", 1)
    .html(getTooltipHtml(data));
  positionTooltip(event, tooltip);

  const tooltipImage = tooltip.select("img").node();

  if (tooltipImage) {
    tooltipImage.onload = () => positionTooltip(event, tooltip);
  }
}

function getNodeColor(data) {
  if (data.color) {
    return data.color;
  }

  return GROUP_COLORS[data.group % GROUP_COLORS.length][data.center ? 1 : 0];
}

function seedNodesFromCenter(nodes) {
  nodes.forEach((node) => {
    node.x = Number.NaN;
    node.y = Number.NaN;
    node.vx = 0;
    node.vy = 0;
    node.fx = null;
    node.fy = null;
  });
}

function applyFilterState(graph, activeCategory) {
  const visibleGroups = getVisibleGroups(graph.nodes || [], activeCategory);
  const activeNodes = graph.nodes.filter((node) => isNodeVisible(node, visibleGroups));
  const activeLinks = graph.links.filter((linkItem) => isLinkVisible(linkItem, visibleGroups));

  graph.nodeSelection?.interrupt().style("display", "none");
  graph.hitTargetSelection?.interrupt().style("display", "none");
  graph.linkSelection?.interrupt().style("display", "none");
  graph.currentVisibleGroups = visibleGroups;
  seedNodesFromCenter(activeNodes);
  graph.simulation.nodes(activeNodes);
  graph.linkForce.links(activeLinks);
  graph.renderGraph?.();

  graph.nodeSelection
    .style("display", (data) => (isNodeVisible(data, visibleGroups) ? null : undefined))
    .style("pointer-events", (data) => (isNodeVisible(data, visibleGroups) ? "auto" : "none"))
    .attr("r", (data) => getNodeRadius(data, graph.radius, graph.aboutOpen))
    .style("display", (data) => (isNodeVisible(data, visibleGroups) ? null : "none"));
  graph.hitTargetSelection
    .style("display", (data) => (isNodeVisible(data, visibleGroups) ? null : undefined))
    .style("pointer-events", (data) => (isNodeVisible(data, visibleGroups) ? "auto" : "none"))
    .attr("r", (data) => getHitRadius(data, graph.radius, graph.aboutOpen))
    .style("display", (data) => (isNodeVisible(data, visibleGroups) ? null : "none"));
  graph.haloSelection
    ?.interrupt()
    .style("opacity", 0)
    .attr("r", 0)
    .style("pointer-events", "none");
  graph.linkSelection
    .style("display", (data) => (isLinkVisible(data, visibleGroups) ? null : "none"));
  graph.simulation.alpha(1).alphaTarget(0).restart();
}

export function BouquetView({ activeCategory, projects, radius, aboutAnimation, aboutOpen, onDismissAbout, onSelect }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const graphRef = useRef(null);
  const aboutPointerRef = useRef(null);
  const activeCategoryRef = useRef(activeCategory);
  const { nodes, links } = useProjectGraph(projects);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) {
      return undefined;
    }

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const simulationNodes = nodes.map((node) => {
      return { ...node };
    });
    const simulationLinks = links.map((linkItem) => ({ ...linkItem }));
    const forceSettings = getBouquetForceSettings(aboutOpen, width, height);

    svg.selectAll("*").remove();
    const viewBoxScale = width < 720 ? 1.49 : 0.97;
    svg
      .attr("viewBox", [(-width * viewBoxScale) / 2, (-height * viewBoxScale) / 2, width * viewBoxScale, height * viewBoxScale])
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chargeForce = d3.forceManyBody().strength(forceSettings.charge);
    const centerForce = d3.forceCenter(0, 0).strength(forceSettings.center);
    const radialForce = d3.forceRadial(forceSettings.radialRadius, 0, 0).strength(forceSettings.radialStrength);
    const aboutSpaceForce = forceAboutSpace(radius).amount(forceSettings.aboutAmount);
    const xForce = d3.forceX(10).strength(forceSettings.xy);
    const yForce = d3.forceY(1).strength(forceSettings.xy);
    const linkForce = d3.forceLink(simulationLinks).id((node) => node.id).distance(5).strength(0.7);

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force("link", linkForce)
      .force("charge", chargeForce)
      .force("center", centerForce)
      .force("radial", radialForce)
      .force("aboutSpace", aboutSpaceForce)
      .force("x", xForce)
      .force("y", yForce);

    graphRef.current = {
      aboutSpaceForce,
      centerForce,
      chargeForce,
      height,
      links: simulationLinks,
      linkForce,
      nodes: simulationNodes,
      radius,
      radialForce,
      simulation,
      width,
      xForce,
      yForce,
      aboutOpen,
      currentForceSettings: forceSettings
    };

    const link = svg.append("g").attr("class", "graph-links").selectAll("line").data(simulationLinks).join("line");
    const halo = svg
      .append("g")
      .attr("class", "graph-halos")
      .selectAll("circle")
      .data(simulationNodes)
      .join("circle")
      .attr("class", "graph-halo")
      .attr("r", 0)
      .style("opacity", 0);

    const node = svg
      .append("g")
      .attr("class", "graph-nodes")
      .selectAll("circle")
      .data(simulationNodes)
      .join("circle")
      .attr("r", (data) => (data.center ? radius * 1.07 : radius))
      .attr("fill", getNodeColor)
      .style("--node-color", getNodeColor)
      .attr(
        "class",
        (data) => `graph-node group-${data.group % GROUP_COLORS.length} ${data.center ? "is-center" : ""} ${data.placeholder ? "is-placeholder" : ""}`
      )
      .on("click", (event, data) => {
        if (graphRef.current?.interactionsDisabled || data.placeholder || data.categoryNode) {
          return;
        }

        onSelect(data.projectIndex, data.imageIndex);
      })
      .on("mouseenter", (event, data) => {
        d3.select(event.currentTarget).classed("is-hovered", true);

        if (graphRef.current?.interactionsDisabled) {
          d3.select(event.currentTarget)
            .classed("is-about-hovered", true)
            .transition()
            .duration(260)
            .style("fill", getNodeColor(data));
          halo
            .filter((haloData) => haloData.id === data.id)
            .raise()
            .transition()
            .duration(280)
            .attr("r", (haloData) => (haloData.center ? radius * 3.1 : radius * 2.9))
            .style("opacity", 0.42)
            .attr("fill", getNodeColor);
          return;
        }

        showTooltip(event, tooltip, data);
      })
      .on("mousemove", (event) => {
        if (graphRef.current?.interactionsDisabled) {
          return;
        }

        positionTooltip(event, tooltip);
      })
      .on("mouseleave", (event) => {
        const targetNode = d3.select(event.currentTarget);
        const targetData = targetNode.datum();
        targetNode.classed("is-hovered", false);

        if (graphRef.current?.interactionsDisabled) {
          targetNode
            .classed("is-about-hovered", false)
            .transition()
            .duration(520)
            .style("fill", null);
          halo
            .filter((haloData) => haloData.id === targetData.id)
            .transition()
            .duration(620)
            .style("opacity", 0)
            .attr("r", 0);
        }

        tooltip.style("opacity", 0);
      })
      .call(
        d3
          .drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.28).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
      );

    const hitTarget = svg
      .append("g")
      .attr("class", "graph-hit-targets")
      .selectAll("circle")
      .data(simulationNodes)
      .join("circle")
      .attr("class", "graph-hit-target")
      .attr("r", (data) => (data.center ? radius * 1.07 : radius))
      .style("fill", "transparent")
      .on("click", (event, data) => {
        if (graphRef.current?.interactionsDisabled || data.placeholder || data.categoryNode) {
          return;
        }

        onSelect(data.projectIndex, data.imageIndex);
      })
      .on("mouseenter", (event, data) => {
        const targetNode = node.filter((nodeData) => nodeData.id === data.id);
        targetNode.classed("is-hovered", true);

        if (graphRef.current?.interactionsDisabled) {
          targetNode
            .classed("is-about-hovered", true)
            .transition()
            .duration(260)
            .style("fill", getNodeColor(data));
          halo
            .filter((haloData) => haloData.id === data.id)
            .raise()
            .transition()
            .duration(280)
            .attr("r", (haloData) => (haloData.center ? radius * 3.1 : radius * 2.9))
            .style("opacity", 0.42)
            .attr("fill", getNodeColor);
          return;
        }

        showTooltip(event, tooltip, data);
      })
      .on("mousemove", (event) => {
        if (graphRef.current?.interactionsDisabled) {
          return;
        }

        positionTooltip(event, tooltip);
      })
      .on("mouseleave", (event) => {
        const targetData = d3.select(event.currentTarget).datum();
        const targetNode = node.filter((nodeData) => nodeData.id === targetData.id);
        targetNode.classed("is-hovered", false);

        if (graphRef.current?.interactionsDisabled) {
          targetNode
            .classed("is-about-hovered", false)
            .transition()
            .duration(520)
            .style("fill", null);
          halo
            .filter((haloData) => haloData.id === targetData.id)
            .transition()
            .duration(620)
            .style("opacity", 0)
            .attr("r", 0);
        }

        tooltip.style("opacity", 0);
      })
      .call(
        d3
          .drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.28).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
      );

    function renderGraph() {
      link
        .attr("x1", (data) => data.source.x)
        .attr("y1", (data) => data.source.y)
        .attr("x2", (data) => data.target.x)
        .attr("y2", (data) => data.target.y);

      node.attr("cx", (data) => data.x).attr("cy", (data) => data.y);
      halo.attr("cx", (data) => data.x).attr("cy", (data) => data.y);
      hitTarget.attr("cx", (data) => data.x).attr("cy", (data) => data.y);
      node.filter((data) => data.center).raise();
    }

    graphRef.current.nodeSelection = node;
    graphRef.current.haloSelection = halo;
    graphRef.current.hitTargetSelection = hitTarget;
    graphRef.current.linkSelection = link;
    graphRef.current.renderGraph = renderGraph;
    applyFilterState(graphRef.current, activeCategoryRef.current);
    simulation.on("tick", renderGraph);

    return () => {
      simulation.stop();
      graphRef.current = null;
      svg.selectAll("*").remove();
    };
  }, [links, nodes, onSelect, radius]);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;

    if (!graphRef.current) {
      return;
    }

    applyFilterState(graphRef.current, activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (!graphRef.current) {
      return undefined;
    }

    const graph = graphRef.current;
    graph.aboutOpen = aboutOpen;
    graph.radius = radius;
    const visibleGroups = graph.currentVisibleGroups;
    graph.interactionsDisabled = aboutOpen;
    d3.select(svgRef.current).classed("is-about-active", aboutOpen);
    d3.select(tooltipRef.current).style("opacity", 0);
    graph.nodeSelection?.classed("is-about-hovered", false).classed("is-hovered", false).style("fill", null);
    graph.haloSelection?.transition().duration(aboutOpen ? 220 : 420).style("opacity", 0).attr("r", 0);
    graph.hitTargetSelection
      ?.transition()
      .duration(aboutOpen ? 420 : 520)
      .attr("r", (data) => (isNodeVisible(data, visibleGroups) ? getHitRadius(data, radius, aboutOpen) : 0));
    graph.nodeSelection
      ?.transition()
      .duration(aboutOpen ? 420 : 520)
      .attr("r", (data) => (isNodeVisible(data, visibleGroups) ? getNodeRadius(data, radius, aboutOpen) : 0));
    const targetForceSettings = getBouquetForceSettings(aboutOpen, graph.width, graph.height);
    const startForceSettings = graph.currentForceSettings || getBouquetForceSettings(!aboutOpen, graph.width, graph.height);
    const duration = aboutOpen ? aboutAnimation.graphEnterDuration : aboutAnimation.graphExitDuration;
    const animation = d3.timer((elapsed) => {
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = ABOUT_FORCE_TRANSITION.ease(progress);
      const nextForceSettings = interpolateBouquetForceSettings(startForceSettings, targetForceSettings, easedProgress);

      applyBouquetForceSettings(graph, nextForceSettings);
      graph.currentForceSettings = nextForceSettings;

      if (progress >= 1) {
        animation.stop();
        applyBouquetForceSettings(graph, targetForceSettings);
        graph.currentForceSettings = targetForceSettings;
        graph.simulation.alphaTarget(0);
      }
    });

    return () => {
      animation.stop();
    };
  }, [aboutAnimation.graphEnterDuration, aboutAnimation.graphExitDuration, aboutOpen, radius]);

  const handlePointerDown = (event) => {
    if (!aboutOpen) {
      return;
    }

    aboutPointerRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
  };

  const handlePointerUp = (event) => {
    if (!aboutOpen || !aboutPointerRef.current || aboutPointerRef.current.pointerId !== event.pointerId) {
      return;
    }

    const movement = Math.hypot(event.clientX - aboutPointerRef.current.x, event.clientY - aboutPointerRef.current.y);
    aboutPointerRef.current = null;

    if (movement <= 6) {
      onDismissAbout();
    }
  };

  return (
    <section
      className="view-shell view-shell-bouquet fixed inset-0 z-10 overflow-hidden"
      aria-label="Bouquet project map"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <svg ref={svgRef} id="graph" className="block h-screen w-screen" />
      <div ref={tooltipRef} className="image-tooltip" />
    </section>
  );
}
