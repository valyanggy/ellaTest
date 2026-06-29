import { useMemo } from "react";

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

const NAILED_JPEG_TAIL_ANCHORS = {
  left: [
    [-0.38, 0.95],
    [-0.64, 1.25],
    [-0.78, 1.55],
    [-0.96, 1.85],
    [-1.1, 2.15],
    [-1.24, 2.45],
    [-1.38, 2.75],
    [-1.52, 3.05],
    [-1.66, 3.35]
  ],
  right: [
    [0.38, 0.95],
    [0.64, 1.25],
    [0.78, 1.55],
    [0.96, 1.85],
    [1.1, 2.15],
    [1.24, 2.45],
    [1.38, 2.75],
    [1.52, 3.05],
    [1.66, 3.35]
  ]
};

const FLOWER_PETAL_COUNT = 6;
const GROUP_CENTER_COLORS = {
  flower: "#000",
  worm: "#2a441f"
};

function hashString(value) {
  return Array.from(value).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % 9973, 7);
}

function getPlaceholderSlots(totalSlots, filledSlots, seedValue) {
  const missingSlots = Math.max(0, totalSlots - filledSlots);
  const slots = Array.from({ length: totalSlots }, (_, index) => index);
  let seed = hashString(seedValue);

  for (let index = slots.length - 1; index > 0; index -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const swapIndex = seed % (index + 1);
    [slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]];
  }

  return new Set(slots.slice(0, missingSlots));
}

function normalizeClusterShape(value) {
  const normalizedValue = String(value || "").toLowerCase();

  if (normalizedValue === "worm") {
    return "worm";
  }

  if (normalizedValue === "flower" || normalizedValue === "sunflower") {
    return "flower";
  }

  return "bow";
}

function getProjectCategory(project) {
  return project.filterItem || project.tags?.[0] || project.title;
}

function getClusterSummary(project) {
  return {
    imageTitle: "",
    imageUrl: "",
    title: `${project.title} (${project.media.length})`
  };
}

function getProjectColors(project) {
  return {
    counter: project.counterNodeColor || project.clusterColor || "",
    ghost: project.ghostNodeColor || project.normalNodeColor || project.clusterColor || "",
    normal: project.normalNodeColor || project.clusterColor || ""
  };
}

function buildProjectNodeInfo(project, projectIndex, category) {
  return project.media.map((mediaItem, mediaItemIndex) => ({
    category,
    imageIndex: mediaItemIndex,
    imageTitle: mediaItem.title || project.title,
    imageUrl: mediaItem.imageUrl || "/img/ella_default.png",
    mediaIndex: mediaItem.globalIndex || mediaItemIndex + 1,
    project: {
      media: project.media || [],
      medium: project.medium,
      tags: project.tags || [],
      title: project.title
    },
    projectIndex,
    projectTitle: project.title
  }));
}

function getBowAnatomy(category) {
  return {
    loopAnchors: BOW_LOOP_ANCHORS,
    tailAnchors: category === "Nailed.jpeg" ? NAILED_JPEG_TAIL_ANCHORS : BOW_TAIL_ANCHORS
  };
}

function addCategoryNode(nodes, groupId, category, structureType, clusterSummary, counterColor) {
  nodes.push({
    id: `center_${groupId}`,
    group: groupId,
    category,
    categoryNode: true,
    center: true,
    color: counterColor || GROUP_CENTER_COLORS[structureType],
    imageIndex: null,
    imageTitle: clusterSummary.imageTitle,
    imageUrl: clusterSummary.imageUrl,
    project: { media: [], medium: "", tags: [category], title: category },
    projectIndex: null,
    structureType,
    title: clusterSummary.title
  });
}

function buildClusterShape(structureType, groupId, category, nodeInfo, bowAnatomy, clusterSummary, colors) {
  const nodes = [];
  const links = [];
  const nodeInfoCursor = { index: 0 };

  const getNextInfo = () => {
    const info = nodeInfo[nodeInfoCursor.index];
    nodeInfoCursor.index += 1;
    return info;
  };

  const addNode = (id, options = {}) => {
    const info = options.placeholder ? null : getNextInfo();
    const isPlaceholder = !info;

    nodes.push({
      id,
      group: groupId,
      category,
      imageIndex: isPlaceholder ? null : info.imageIndex,
      imageTitle: isPlaceholder ? "" : info.imageTitle,
      imageUrl: isPlaceholder ? "" : info.imageUrl,
      mediaIndex: isPlaceholder ? null : info.mediaIndex,
      placeholder: isPlaceholder,
      color: isPlaceholder ? colors.ghost : colors.normal,
      project: isPlaceholder ? { media: [], medium: "", tags: [category], title: category } : info.project,
      projectIndex: isPlaceholder ? null : info.projectIndex,
      structureType,
      title: isPlaceholder ? "i am just happy to be here!" : info.projectTitle,
      ...options
    });
  };

  addCategoryNode(nodes, groupId, category, structureType, clusterSummary, colors.counter);

  if (structureType === "bow") {
    const { loopAnchors, tailAnchors } = bowAnatomy;
    const totalBowSlots = loopAnchors.left.length + loopAnchors.right.length + tailAnchors.left.length + tailAnchors.right.length;
    const placeholderSlots = getPlaceholderSlots(totalBowSlots, nodeInfo.length, `${category}-${groupId}`);
    let bowSlotIndex = 0;

    ["left", "right"].forEach((side) => {
      const loopCount = loopAnchors[side].length;
      const tailCount = tailAnchors[side].length;

      for (let index = 1; index <= loopCount; index += 1) {
        const id = `${side}${index}_${groupId}`;
        addNode(id, { placeholder: placeholderSlots.has(bowSlotIndex) });
        bowSlotIndex += 1;

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
        addNode(id, { placeholder: placeholderSlots.has(bowSlotIndex) });
        bowSlotIndex += 1;

        links.push({
          source: index === 1 ? `center_${groupId}` : `${side}Tail${index - 1}_${groupId}`,
          target: id
        });
      }
    });
  }

  if (structureType === "worm") {
    nodeInfo.forEach((_, index) => {
      const id = `node${index + 1}_${groupId}`;
      addNode(id);
      links.push({ source: index === 0 ? `center_${groupId}` : `node${index}_${groupId}`, target: id });
    });
  }

  if (structureType === "flower") {
    const petalCount = Math.min(nodeInfo.length, FLOWER_PETAL_COUNT);

    for (let index = 1; index <= petalCount; index += 1) {
      const id = `petal${index}_${groupId}`;
      addNode(id);
      links.push({ source: `center_${groupId}`, target: id });
    }

    for (let index = petalCount + 1; index <= nodeInfo.length; index += 1) {
      const id = `petalTail${index - petalCount}_${groupId}`;
      const previousId = index === petalCount + 1 ? `petal${petalCount}_${groupId}` : `petalTail${index - petalCount - 1}_${groupId}`;
      addNode(id);
      links.push({ source: previousId, target: id });
    }
  }

  return { nodes, links };
}

export function useProjectGraph(projects) {
  return useMemo(() => {
    const nodes = [];
    const links = [];

    projects.forEach((project, projectIndex) => {
      const category = getProjectCategory(project);
      const structureType = normalizeClusterShape(project.clusterShape);
      const nodeInfo = buildProjectNodeInfo(project, projectIndex, category);
      const bowAnatomy = getBowAnatomy(category);
      const clusterSummary = getClusterSummary(project);
      const shape = buildClusterShape(structureType, projectIndex, category, nodeInfo, bowAnatomy, clusterSummary, getProjectColors(project));
      nodes.push(...shape.nodes);
      links.push(...shape.links);
    });

    return { nodes, links };
  }, [projects]);
}
