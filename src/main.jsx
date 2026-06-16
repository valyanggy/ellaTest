import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as d3 from "d3";
import { animateSlotText, buildSlotText, chromatic, clearSlotText } from "slot-text";
import "slot-text/style.css";
import { loadProjects } from "./content/projects";
import "./styles.css";

const CATEGORIES = [
  "2D work",
  "Cakes",
  "House Lamp",
  "Makeup Hair",
  "Oakwood - Photo Series",
  "Random",
  "Teeth",
  "Thesis Progress",
  "Time Ripens All Things",
  "Video Work"
];

const GROUP_COLORS = [
  ["#e5d70c", "#e50c0c"],
  ["#e519e5", "#e50c89"],
  ["#0ce5d7", "#0c8be5"],
  ["#0c882b", "#2a441f"],
  ["#0ce5a0", "#1a0ce5"],
  ["#ab0ce5", "#eceaff"],
  ["#e5800c", "#e5d70c"]
];

const PROTOTYPE_STRUCTURE_TYPES = ["bowknot", "sunflower", "ops", "bowknot", "bowknot", "sunflower", "ops", "bowknot", "bowknot", "sunflower", "bowknot"];
const ABOUT_NODE_SCALE = .26;

function cubicBezierEase(x1, y1, x2, y2) {
  const sampleCurveX = (t) => ((3 * x1 - 3 * x2 + 1) * t + (-6 * x1 + 3 * x2)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t) => ((3 * y1 - 3 * y2 + 1) * t + (-6 * y1 + 3 * y2)) * t * t + 3 * y1 * t;
  const sampleDerivativeX = (t) => (3 * (3 * x1 - 3 * x2 + 1) * t + 2 * (-6 * x1 + 3 * x2)) * t + 3 * x1;

  return (x) => {
    if (x <= 0 || x >= 1) {
      return x;
    }

    let t = x;

    for (let index = 0; index < 6; index += 1) {
      const derivative = sampleDerivativeX(t);

      if (Math.abs(derivative) < 0.001) {
        break;
      }

      t -= (sampleCurveX(t) - x) / derivative;
    }

    return sampleCurveY(Math.max(0, Math.min(1, t)));
  };
}

const ABOUT_FORCE_TRANSITION = {
  enterDuration: 1500,
  exitDuration: 2000,
  ease: cubicBezierEase(0.873, -0.003, 0, 1.002)
};

const ABOUT_TEXT_LINES = [
  "Ella Varr Burgess is a multimedia artist,",
  "a pâtissier, and a good friend.",
  "ellavarr@gmail.com",
  "@varraway",
  "Site by Come On, Computer."
];

const DEFAULT_ABOUT_ANIMATION = {
  textEnterDelay: 260,
  textEnterDuration: 680,
  textExitDuration: 1300,
  textStagger: 4,
  textExitOffset: 0,
  textBounce: 1,
  textColorFade: 789,
  hueFrom: 0,
  hueSpread: 720,
  hueSaturation: 92,
  hueLightness: 45,
  graphEnterDuration: 1500,
  graphExitDuration: 1500
};

const BOW_LOOP_ANCHORS = {
  left: [
    [-1.05, -0.25],
    [-1.7, -0.65],
    [-2.35, -0.45],
    [-2.65, 0.18],
    [-2.2, 0.72],
    [-1.5, 0.72],
    [-0.92, 0.2]
  ],
  right: [
    [1.05, -0.25],
    [1.7, -0.65],
    [2.35, -0.45],
    [2.65, 0.18],
    [2.2, 0.72],
    [1.5, 0.72],
    [0.92, 0.2]
  ]
};

const BOW_TAIL_ANCHORS = {
  left: [
    [-0.38, 0.95],
    [-0.78, 1.55],
    [-1.1, 2.15]
  ],
  right: [
    [0.38, 0.95],
    [0.78, 1.55],
    [1.1, 2.15]
  ]
};

function normalizeFilterValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function projectMatchesCategory(project, category) {
  const normalizedCategory = normalizeFilterValue(category);
  const searchableValues = [
    project.title,
    project.medium,
    ...(project.tags || []),
    ...(project.media || []).map((item) => (item.type === "video" ? "Video Work" : ""))
  ].map(normalizeFilterValue);

  return searchableValues.some((value) => value === normalizedCategory || value.includes(normalizedCategory));
}

function buildPrototypeNodeInfo(projects) {
  const items = projects.flatMap((project, projectIndex) =>
    project.images.map((image, imageIndex) => ({
      projectIndex,
      imageIndex,
      title: image.title || project.title,
      imageTitle: image.title || project.title,
      imageUrl: image.imageUrl || "/img/ella_default.png",
      projectTitle: project.title
    }))
  );

  return items.length > 0
    ? items
    : [
        {
          projectIndex: 0,
          imageIndex: 0,
          title: "Ella Varr Burgess",
          imageTitle: "Ella Varr Burgess",
          imageUrl: "/img/ella_default.png",
          projectTitle: "Ella Varr Burgess"
        }
      ];
}

function buildClusterShape(structureType, groupId, nodeInfo, nodeInfoCursor) {
  const nodes = [];
  const links = [];

  const getNextInfo = () => {
    const info = nodeInfo[nodeInfoCursor.index % nodeInfo.length];
    nodeInfoCursor.index += 1;
    return info;
  };

  const addNode = (id, options = {}) => {
    const info = getNextInfo();
    nodes.push({
      id,
      group: groupId,
      projectIndex: info.projectIndex,
      imageIndex: info.imageIndex,
      title: info.projectTitle,
      imageTitle: info.imageTitle,
      imageUrl: info.imageUrl,
      structureType,
      ...options
    });
  };

  if (structureType === "bowknot") {
    const loopCount = 7;
    const tailCount = 3;

    ["left", "right"].forEach((side) => {
      for (let index = 1; index <= loopCount; index += 1) {
        const id = `${side}${index}_${groupId}`;
        addNode(id, { bowAnchor: BOW_LOOP_ANCHORS[side][index - 1] });

        links.push({
          source: index === 1 ? `center_${groupId}` : `${side}${index - 1}_${groupId}`,
          target: id
        });

        if (index === loopCount) {
          links.push({ source: id, target: `center_${groupId}` });
        }
      }

      for (let index = 1; index <= tailCount; index += 1) {
        const id = `${side}Tail${index}_${groupId}`;
        addNode(id, { bowAnchor: BOW_TAIL_ANCHORS[side][index - 1] });

        links.push({
          source: index === 1 ? `center_${groupId}` : `${side}Tail${index - 1}_${groupId}`,
          target: id
        });
      }
    });
  }

  if (structureType === "sunflower") {
    const petalCount = 6;

    for (let index = 1; index <= petalCount; index += 1) {
      const id = `node${index}_${groupId}`;
      addNode(id);

      links.push({ source: `center_${groupId}`, target: id });
    }
  }

  if (structureType === "ops") {
    const lineCount = 4;

    for (let index = 1; index <= lineCount; index += 1) {
      const id = `node${index}_${groupId}`;
      addNode(id);

      if (index > 1) {
        links.push({ source: `node${index - 1}_${groupId}`, target: id });
      }
    }
  }

  addNode(`center_${groupId}`, { center: true, bowAnchor: structureType === "bowknot" ? [0, 0] : undefined });

  return { nodes, links };
}

function forceBowShape(radius, strength = 0.055) {
  let forceNodes = [];

  function force(alpha) {
    const centers = new Map();

    forceNodes.forEach((node) => {
      if (node.center && node.structureType === "bowknot") {
        centers.set(node.group, node);
      }
    });

    forceNodes.forEach((node) => {
      if (!node.bowAnchor || node.center) {
        return;
      }

      const center = centers.get(node.group);

      if (!center) {
        return;
      }

      const anchorScale = radius * 1.55;
      const targetX = center.x + node.bowAnchor[0] * anchorScale;
      const targetY = center.y + node.bowAnchor[1] * anchorScale;

      node.vx += (targetX - node.x) * strength * alpha;
      node.vy += (targetY - node.y) * strength * alpha;
    });
  }

  force.initialize = (nodesToInitialize) => {
    forceNodes = nodesToInitialize;
  };

  return force;
}

function forceAboutSpace(radius, strength = 0.22) {
  let forceNodes = [];
  let amount = 0;

  function force(alpha) {
    if (amount <= 0) {
      return;
    }

    const clearRadius = Math.max(radius * 0.5, .2);

    forceNodes.forEach((node) => {
      const distance = Math.hypot(node.x, node.y) || 1;

      if (distance >= clearRadius) {
        return;
      }

      const push = ((clearRadius - distance) / clearRadius) * strength * amount * alpha * clearRadius;

      node.vx += (node.x / distance) * push;
      node.vy += (node.y / distance) * push;
    });
  }

  force.initialize = (nodesToInitialize) => {
    forceNodes = nodesToInitialize;
  };

  force.amount = (value) => {
    amount = value;
    return force;
  };

  return force;
}

function getBouquetForceSettings(aboutOpen, width, height) {
  return {
    charge: aboutOpen ? -200 : -92,
    center: aboutOpen ? 0.018 : 0.06,
    radialRadius: Math.min(width, height) * (aboutOpen ? 0.42 : 0.3),
    radialStrength: aboutOpen ? 0.92 : 0.006,
    xy: aboutOpen ? 0.08 : 0.16,
    aboutAmount: aboutOpen ? 1 : 0,
    alphaTarget: aboutOpen ? 0.28 : 0.14
  };
}

function interpolateBouquetForceSettings(start, end, amount) {
  return Object.fromEntries(
    Object.keys(end).map((key) => [key, d3.interpolateNumber(start[key], end[key])(amount)])
  );
}

function applyBouquetForceSettings(graph, settings) {
  graph.aboutSpaceForce.amount(settings.aboutAmount);
  graph.chargeForce.strength(settings.charge);
  graph.centerForce.strength(settings.center);
  graph.radialForce.radius(settings.radialRadius).strength(settings.radialStrength);
  graph.xForce.strength(settings.xy);
  graph.yForce.strength(settings.xy);
  graph.simulation.alphaTarget(settings.alphaTarget).restart();
}

function useProjectGraph(projects) {
  return useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeInfo = buildPrototypeNodeInfo(projects);
    const nodeInfoCursor = { index: 0 };

    PROTOTYPE_STRUCTURE_TYPES.forEach((structureType, index) => {
      const shape = buildClusterShape(structureType, index, nodeInfo, nodeInfoCursor);
      nodes.push(...shape.nodes);
      links.push(...shape.links);
    });

    return { nodes, links };
  }, [projects]);
}

function AboutPanel({ aboutOpen, onToggle }) {
  return (
    <section className="fixed left-4 top-2.5 z-20 max-md:left-2.5">
      <button
        className="h-10 min-w-36 cursor-pointer border-0 bg-transparent px-0 text-left font-normal text-black max-md:min-w-0 max-md:px-2"
        type="button"
        aria-expanded={aboutOpen}
        onClick={onToggle}
      >
        <span aria-hidden="true" className={aboutOpen ? "pr-1 text-[#e519e5]" : "hidden"}>
          *
        </span>
        Ella Varr Burgess
      </button>
    </section>
  );
}

function AboutSlotText({ label, options, text }) {
  const textRef = useRef(null);
  const previousTextRef = useRef(text);

  useEffect(() => {
    if (!textRef.current) {
      return undefined;
    }

    buildSlotText(textRef.current, text);
    previousTextRef.current = text;

    return () => {
      if (textRef.current) {
        clearSlotText(textRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!textRef.current || previousTextRef.current === text) {
      return;
    }

    animateSlotText(textRef.current, text, options);
    previousTextRef.current = text;
  }, [options, text]);

  return <span ref={textRef} aria-label={label} />;
}

function AboutCenter({ aboutAnimation, aboutOpen }) {
  const [textOpen, setTextOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(true);
  const slotColor = useMemo(
    () =>
      chromatic({
        from: aboutAnimation.hueFrom,
        spread: aboutAnimation.hueSpread,
        saturation: aboutAnimation.hueSaturation,
        lightness: aboutAnimation.hueLightness
      }),
    [aboutAnimation.hueFrom, aboutAnimation.hueLightness, aboutAnimation.hueSaturation, aboutAnimation.hueSpread]
  );
  const slotOptions = useMemo(
    () => ({
      direction: textOpen ? "up" : "down",
      duration: textOpen ? aboutAnimation.textEnterDuration : aboutAnimation.textExitDuration,
      stagger: aboutAnimation.textStagger,
      exitOffset: aboutAnimation.textExitOffset,
      easing: "cubic-bezier(0.873, -0.003, 0, 1.002)",
      bounce: aboutAnimation.textBounce,
      color: slotColor,
      colorFade: aboutAnimation.textColorFade,
      skipUnchanged: false
    }),
    [
      aboutAnimation.textBounce,
      aboutAnimation.textColorFade,
      aboutAnimation.textEnterDuration,
      aboutAnimation.textExitDuration,
      aboutAnimation.textExitOffset,
      aboutAnimation.textStagger,
      slotColor,
      textOpen
    ]
  );
  const longestLineLength = useMemo(() => Math.max(...ABOUT_TEXT_LINES.map((line) => line.length)), []);
  const exitSettleTime = aboutAnimation.textExitDuration + aboutAnimation.textExitOffset + aboutAnimation.textStagger * longestLineLength + aboutAnimation.textColorFade;
  const hiddenText = (line) => " ".repeat(line.length);
  const visibleText = (line) => (textOpen ? line : hiddenText(line));

  useEffect(() => {
    if (aboutOpen) {
      setIsPresent(true);
      setTextOpen(false);

      const enterTimer = window.setTimeout(() => {
        setTextOpen(true);
      }, aboutAnimation.textEnterDelay);

      return () => {
        window.clearTimeout(enterTimer);
      };
    }

    setTextOpen(false);

    const exitTimer = window.setTimeout(() => {
      setIsPresent(false);
    }, exitSettleTime);

    return () => {
      window.clearTimeout(exitTimer);
    };
  }, [aboutAnimation.textEnterDelay, aboutOpen, exitSettleTime]);

  return (
    <section
      className={[
        "about-center fixed left-1/2 top-1/2 z-0 grid w-[min(520px,calc(100vw-44px))] -translate-x-1/2 -translate-y-1/2 gap-2 text-center",
        isPresent ? "opacity-100" : "opacity-0 pointer-events-none"
      ].join(" ")}
      aria-hidden={!isPresent}
    >
      <span aria-hidden="true" className="about-focus-field" />
      <p className="about-line">
        <AboutSlotText text={visibleText(ABOUT_TEXT_LINES[0])} options={slotOptions} label={ABOUT_TEXT_LINES[0]} />
      </p>
      <p className="about-line">
        <AboutSlotText text={visibleText(ABOUT_TEXT_LINES[1])} options={slotOptions} label={ABOUT_TEXT_LINES[1]} />
      </p>
      <p className="about-line pt-2">
        <a href="mailto:ellavarr@gmail.com">
          <AboutSlotText text={visibleText(ABOUT_TEXT_LINES[2])} options={slotOptions} label={ABOUT_TEXT_LINES[2]} />
        </a>
      </p>
      <p className="about-line">
        <a href="https://www.instagram.com/varraway/">
          <AboutSlotText text={visibleText(ABOUT_TEXT_LINES[3])} options={slotOptions} label={ABOUT_TEXT_LINES[3]} />
        </a>
      </p>
      <p className="about-line pt-2">
        <AboutSlotText text={visibleText(ABOUT_TEXT_LINES[4])} options={slotOptions} label={ABOUT_TEXT_LINES[4]} />
      </p>
    </section>
  );
}

function TopNav({ activeCategory, disabled, onCategory }) {
  return (
    <nav
      className={[
        "fixed left-1/2 top-4 z-10 flex w-[min(700px,calc(100vw-220px))] -translate-x-1/2 flex-wrap justify-center gap-x-2 text-xs font-normal max-md:top-14 max-md:w-[calc(100vw-20px)] max-md:text-[11px]",
        disabled ? "is-about-muted pointer-events-none" : ""
      ].join(" ")}
      aria-label="Project categories"
      aria-disabled={disabled}
    >
      {CATEGORIES.map((category, index) => (
        <button
          key={category}
          className={[
            "cursor-pointer border-0 bg-transparent py-0.5 text-black transition-colors",
            activeCategory === category ? "text-[#e519e5]" : "hover:text-[#e519e5]"
          ].join(" ")}
          type="button"
          disabled={disabled}
          aria-pressed={activeCategory === category}
          onClick={() => onCategory(category)}
        >
          <span aria-hidden="true" className={index === 0 ? "hidden" : "pr-2"}>
            .
          </span>
          <span aria-hidden="true" className={activeCategory === category ? "pr-1" : "hidden"}>
            *
          </span>
          {category}
        </button>
      ))}
    </nav>
  );
}

function EmptyFilterState({ activeCategory }) {
  return (
    <section className="fixed inset-0 grid place-content-center px-6 text-center" aria-live="polite">
      <p>
        No projects tagged <strong>{activeCategory}</strong> yet.
      </p>
    </section>
  );
}

function BouquetView({ projects, radius, aboutAnimation, aboutOpen, onSelect }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const graphRef = useRef(null);
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
    const viewBoxScale = width < 720 ? 2.05 : 1.32;
    svg
      .attr("viewBox", [(-width * viewBoxScale) / 2, (-height * viewBoxScale) / 2, width * viewBoxScale, height * viewBoxScale])
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chargeForce = d3.forceManyBody().strength(forceSettings.charge);
    const centerForce = d3.forceCenter(0, 0).strength(forceSettings.center);
    const radialForce = d3.forceRadial(forceSettings.radialRadius, 0, 0).strength(forceSettings.radialStrength);
    const aboutSpaceForce = forceAboutSpace(radius).amount(forceSettings.aboutAmount);
    const xForce = d3.forceX(10).strength(forceSettings.xy);
    const yForce = d3.forceY(1).strength(forceSettings.xy);

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force("link", d3.forceLink(simulationLinks).id((node) => node.id).distance(5).strength(0.7))
      .force("charge", chargeForce)
      .force("center", centerForce)
      .force("radial", radialForce)
      .force("aboutSpace", aboutSpaceForce)
      .force("bowShape", forceBowShape(radius))
      .force("x", xForce)
      .force("y", yForce);

    graphRef.current = {
      aboutSpaceForce,
      centerForce,
      chargeForce,
      height,
      radialForce,
      simulation,
      width,
      xForce,
      yForce,
      currentForceSettings: forceSettings
    };

    const link = svg.append("g").attr("class", "graph-links").selectAll("line").data(simulationLinks).join("line");

    const node = svg
      .append("g")
      .attr("class", "graph-nodes")
      .selectAll("circle")
      .data(simulationNodes)
      .join("circle")
      .attr("r", (data) => (data.center ? radius * 1.07 : radius))
      .attr("fill", (data) => GROUP_COLORS[data.group % GROUP_COLORS.length][data.center ? 1 : 0])
      .attr("class", (data) => `graph-node group-${data.group % GROUP_COLORS.length} ${data.center ? "is-center" : ""}`)
      .on("click", (event, data) => {
        if (graphRef.current?.interactionsDisabled) {
          return;
        }

        onSelect(data.projectIndex, data.imageIndex);
      })
      .on("mouseenter", (event, data) => {
        if (graphRef.current?.interactionsDisabled) {
          return;
        }

        tooltip
          .style("opacity", 1)
          .html(`<strong>${data.title}</strong><span>${data.imageTitle || ""}</span><img src="${data.imageUrl}" alt="">`);
      })
      .on("mousemove", (event) => {
        if (graphRef.current?.interactionsDisabled) {
          return;
        }

        tooltip.style("left", `${event.clientX}px`).style("top", `${event.clientY}px`);
      })
      .on("mouseleave", () => {
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
      node.filter((data) => data.center).raise();
    }

    graphRef.current.nodeSelection = node;
    simulation.on("tick", renderGraph);

    return () => {
      simulation.stop();
      graphRef.current = null;
      svg.selectAll("*").remove();
    };
  }, [links, nodes, onSelect, radius]);

  useEffect(() => {
    if (!graphRef.current) {
      return undefined;
    }

    const graph = graphRef.current;
    graph.interactionsDisabled = aboutOpen;
    d3.select(svgRef.current).classed("is-about-active", aboutOpen);
    d3.select(tooltipRef.current).style("opacity", 0);
    graph.nodeSelection
      ?.transition()
      .duration(aboutOpen ? 420 : 520)
      .attr("r", (data) => {
        const defaultRadius = data.center ? radius * 1.07 : radius;
        return aboutOpen ? defaultRadius * ABOUT_NODE_SCALE : defaultRadius;
      });
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

  return (
    <section className="fixed inset-0 z-10 overflow-hidden" aria-label="Bouquet project map">
      <svg ref={svgRef} id="graph" className="block h-screen w-screen" />
      <div ref={tooltipRef} className="image-tooltip" />
    </section>
  );
}

function GalleryView({ projects, selected, onSelect }) {
  return (
    <section className="grid gap-14 px-6 pb-24 pt-18 max-md:px-4 max-md:pb-28 max-md:pt-28" aria-label="Project gallery">
      {projects.map((project, projectIndex) => (
        <article className="grid gap-13" key={project.id}>
          <header className="grid grid-cols-[160px_1fr] items-start font-normal max-md:grid-cols-1 max-md:gap-2.5">
            <div className="grid gap-0.5">
              <strong>{project.year}</strong>
              {project.medium && <span>{project.medium}</span>}
            </div>
            <h2 className="m-0 text-right text-[13px] font-normal max-md:text-left">{project.title}</h2>
          </header>
          <div className="flex items-start gap-4.5 overflow-x-auto pb-2.5">
            {project.images.map((image, imageIndex) => (
              <button
                className="grid min-w-48 cursor-pointer gap-0.5 border-0 bg-transparent p-0 text-left text-black"
                key={`${project.id}-${image.imageUrl}-${imageIndex}`}
                type="button"
                onClick={() => onSelect(projectIndex, imageIndex)}
              >
                <span>IMG_{String(imageIndex + 1).padStart(4, "0")}</span>
                <span>{image.title}</span>
                <img
                  className="mt-4 h-[min(360px,38vh)] w-auto max-w-90 bg-neutral-100 object-contain max-md:max-w-65"
                  src={image.imageUrl}
                  alt={image.alt || image.title}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </article>
      ))}
      {selected && (
        <button
          className="fixed inset-0 z-40 grid cursor-zoom-out grid-cols-[minmax(160px,260px)_1fr] items-center gap-6 border-0 bg-white/95 p-9 text-left text-black max-md:grid-cols-1 max-md:content-center max-md:p-5"
          type="button"
          onClick={() => onSelect(null, null)}
        >
          <span>
            {selected.project.title}
            <br />
            {selected.image.title}
          </span>
          <img className="max-h-[calc(100vh-72px)] max-w-full object-contain" src={selected.image.imageUrl} alt={selected.image.alt || selected.image.title} />
        </button>
      )}
    </section>
  );
}

function ViewSwitcher({ disabled, view, setView }) {
  return (
    <nav
      className={[
        "fixed right-4 top-2.5 z-20 flex h-10 items-center gap-3.5 bg-transparent font-normal max-md:right-2.5",
        disabled ? "is-about-muted pointer-events-none" : ""
      ].join(" ")}
      aria-label="View switcher"
      aria-disabled={disabled}
    >
      <button className="cursor-pointer border-0 bg-transparent text-black" type="button" disabled={disabled} onClick={() => setView("bouquet")}>
        <span aria-hidden="true" className={view === "bouquet" ? "pr-1 text-[#e519e5]" : "hidden"}>
          *
        </span>
        Bow
      </button>
      <button className="cursor-pointer border-0 bg-transparent text-black" type="button" disabled={disabled} onClick={() => setView("gallery")}>
        <span aria-hidden="true" className={view === "gallery" ? "pr-1 text-[#e519e5]" : "hidden"}>
          *
        </span>
        Calendar
      </button>
    </nav>
  );
}

function RadiusControl({ disabled, radius, setRadius, view }) {
  const [draftRadius, setDraftRadius] = useState(radius);

  useEffect(() => {
    setDraftRadius(radius);
  }, [radius]);

  const commitRadius = () => {
    setRadius(draftRadius);
  };

  if (view !== "bouquet") {
    return null;
  }

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center bg-transparent px-2.5 py-1.5 max-md:w-[calc(100vw-20px)]"
      aria-label="Coquette control"
    >
      <label className={["grid min-w-30 gap-1 text-center", disabled ? "is-about-muted pointer-events-none" : ""].join(" ")}>
        <span>Coquette: {draftRadius}</span>
        <input
          className="accent-[#4b8e32]"
          disabled={disabled}
          min="18"
          max="50"
          type="range"
          value={draftRadius}
          onChange={(event) => setDraftRadius(Number(event.target.value))}
          onPointerUp={commitRadius}
          onKeyUp={(event) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
              commitRadius();
            }
          }}
        />
      </label>
    </nav>
  );
}

function AnimationControlRow({ label, max, min, name, onChange, step = 1, value }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <input
          className="w-17 border border-black/20 bg-white px-1 py-0.5 text-right"
          max={max}
          min={min}
          name={name}
          step={step}
          type="number"
          value={value}
          onChange={(event) => onChange(name, Number(event.target.value))}
        />
      </span>
      <input
        className="accent-[#e519e5]"
        max={max}
        min={min}
        name={name}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(name, Number(event.target.value))}
      />
    </label>
  );
}

function AboutAnimationControls({ aboutAnimation, aboutOpen, setAboutAnimation, view }) {
  const [open, setOpen] = useState(false);

  if (view !== "bouquet" || aboutOpen) {
    return null;
  }

  const updateAnimation = (name, value) => {
    setAboutAnimation((currentAnimation) => ({
      ...currentAnimation,
      [name]: value
    }));
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 grid max-h-[calc(100vh-120px)] w-[min(280px,calc(100vw-28px))] gap-2 bg-white/85 p-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <button className="cursor-pointer border-0 bg-transparent p-0 text-left text-black" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide" : "Tune"} About Motion
        </button>
        <button className="cursor-pointer border-0 bg-transparent p-0 text-black" type="button" onClick={() => setAboutAnimation(DEFAULT_ABOUT_ANIMATION)}>
          Reset
        </button>
      </div>
      {open && (
        <div className="grid max-h-[calc(100vh-176px)] gap-2 overflow-y-auto pr-1">
          <AnimationControlRow label="Text delay" min={0} max={3000} name="textEnterDelay" value={aboutAnimation.textEnterDelay} onChange={updateAnimation} />
          <AnimationControlRow label="Text enter" min={120} max={2200} name="textEnterDuration" value={aboutAnimation.textEnterDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Text exit" min={120} max={3000} name="textExitDuration" value={aboutAnimation.textExitDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Text stagger" min={0} max={80} name="textStagger" value={aboutAnimation.textStagger} onChange={updateAnimation} />
          <AnimationControlRow label="Exit offset" min={0} max={220} name="textExitOffset" value={aboutAnimation.textExitOffset} onChange={updateAnimation} />
          <AnimationControlRow label="Bounce" min={0} max={1} step={0.01} name="textBounce" value={aboutAnimation.textBounce} onChange={updateAnimation} />
          <AnimationControlRow label="Color fade" min={0} max={1600} name="textColorFade" value={aboutAnimation.textColorFade} onChange={updateAnimation} />
          <AnimationControlRow label="Hue start" min={0} max={360} name="hueFrom" value={aboutAnimation.hueFrom} onChange={updateAnimation} />
          <AnimationControlRow label="Hue spread" min={0} max={720} name="hueSpread" value={aboutAnimation.hueSpread} onChange={updateAnimation} />
          <AnimationControlRow label="Saturation" min={0} max={100} name="hueSaturation" value={aboutAnimation.hueSaturation} onChange={updateAnimation} />
          <AnimationControlRow label="Lightness" min={0} max={100} name="hueLightness" value={aboutAnimation.hueLightness} onChange={updateAnimation} />
          <AnimationControlRow label="Graph enter" min={200} max={5000} name="graphEnterDuration" value={aboutAnimation.graphEnterDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Graph exit" min={200} max={6000} name="graphExitDuration" value={aboutAnimation.graphExitDuration} onChange={updateAnimation} />
        </div>
      )}
    </aside>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("bouquet");
  const [radius, setRadius] = useState(20);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutAnimation, setAboutAnimation] = useState(DEFAULT_ABOUT_ANIMATION);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selected, setSelected] = useState({ projectIndex: null, imageIndex: null });

  useEffect(() => {
    let alive = true;

    loadProjects().then((loadedProjects) => {
      if (alive) {
        setProjects(loadedProjects);
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const filteredProjects = useMemo(
    () => (activeCategory ? projects.filter((project) => projectMatchesCategory(project, activeCategory)) : projects),
    [activeCategory, projects]
  );

  const selectedImage = selected.projectIndex !== null && selected.imageIndex !== null
    ? {
        project: filteredProjects[selected.projectIndex],
        image: filteredProjects[selected.projectIndex]?.images[selected.imageIndex]
      }
    : null;

  const handleCategory = (category) => {
    setActiveCategory((currentCategory) => (currentCategory === category ? null : category));
    setAboutOpen(false);
    setSelected({ projectIndex: null, imageIndex: null });
  };

  const handleSelect = useCallback((projectIndex, imageIndex) => {
    setAboutOpen(false);
    setSelected({ projectIndex, imageIndex });

    if (projectIndex !== null && imageIndex !== null) {
      setView("gallery");
    }
  }, []);

  const handleAboutToggle = () => {
    setAboutOpen((currentOpen) => {
      const nextOpen = !currentOpen;

      if (nextOpen) {
        setView("bouquet");
        setSelected({ projectIndex: null, imageIndex: null });
      }

      return nextOpen;
    });
  };

  const handleViewChange = (nextView) => {
    setView(nextView);

    if (nextView !== "bouquet") {
      setAboutOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <AboutPanel aboutOpen={aboutOpen} onToggle={handleAboutToggle} />
      <TopNav activeCategory={activeCategory} disabled={aboutOpen} onCategory={handleCategory} />
      {loading ? (
        <section className="fixed inset-0 grid place-content-center gap-2 text-center">
          <span className="text-xs">Welcome to</span>
          <strong className="font-junicode text-[32px] font-normal">Ella Varr Burgess</strong>
        </section>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <EmptyFilterState activeCategory={activeCategory} />
          ) : view === "bouquet" ? (
            <BouquetView projects={filteredProjects} radius={radius} aboutAnimation={aboutAnimation} aboutOpen={aboutOpen} onSelect={handleSelect} />
          ) : (
            <GalleryView projects={filteredProjects} selected={selectedImage?.image ? selectedImage : null} onSelect={handleSelect} />
          )}
          <AboutCenter aboutAnimation={aboutAnimation} aboutOpen={aboutOpen && view === "bouquet"} />
          <ViewSwitcher disabled={aboutOpen} view={view} setView={handleViewChange} />
          <RadiusControl disabled={aboutOpen} radius={radius} setRadius={setRadius} view={view} />
          <AboutAnimationControls aboutAnimation={aboutAnimation} aboutOpen={aboutOpen} setAboutAnimation={setAboutAnimation} view={view} />
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
