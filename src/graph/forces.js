import * as d3 from "d3";

export function forceAboutSpace(radius, strength = 0.22) {
  let forceNodes = [];
  let amount = 0;

  function force(alpha) {
    if (amount <= 0) {
      return;
    }

    const clearRadius = Math.max(radius * 0.5, 0.2);

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

export function getBouquetForceSettings(aboutOpen, width, height) {
  return {
    charge: aboutOpen ? -200 : -60,
    center: aboutOpen ? 0.018 : 0,
    radialRadius: Math.min(width, height) * (aboutOpen ? 0.42 : 0.3),
    radialStrength: aboutOpen ? 0.92 : 0,
    xy: aboutOpen ? 0.08 : 0.1,
    aboutAmount: aboutOpen ? 1 : 0,
    alphaTarget: aboutOpen ? 0.28 : 0
  };
}

export function interpolateBouquetForceSettings(start, end, amount) {
  return Object.fromEntries(Object.keys(end).map((key) => [key, d3.interpolateNumber(start[key], end[key])(amount)]));
}

export function applyBouquetForceSettings(graph, settings) {
  graph.aboutSpaceForce.amount(settings.aboutAmount);
  graph.chargeForce.strength(settings.charge);
  graph.centerForce.strength(settings.center);
  graph.radialForce.radius(settings.radialRadius).strength(settings.radialStrength);
  graph.xForce.strength(settings.xy);
  graph.yForce.strength(settings.xy);
  graph.simulation.alphaTarget(settings.alphaTarget).restart();
}
