import { fallbackProjects } from "./fallbackData";
import { createClient } from "@sanity/client";

const CONTENT_ENDPOINT = "https://alex_is_disconnected-ella_burgess.web.val.run/";
const LEGACY_SANITY_PROJECT_ID = "hsvfeudq";
const LEGACY_SANITY_DATASET = "ella-burgess";
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || "production";
const FILLER_PROJECTS = [
  { category: "Makeup Hair", id: "fallback-makeup-hair" },
  { category: "Nailed.jpeg", id: "fallback-nailed-jpeg" }
];
const FILTER_ITEM_ALIASES = {
  "Oakwood - Photo Series": "Pics-Or-It-Didn't-Happen"
};
const HIDDEN_PROJECT_TITLES = new Set(["Beach", "Bowl"]);

const PROJECTS_QUERY = `*[_type == "post" && !(_id in path("drafts.**"))] | order(_createdAt asc, title asc) {
  _id,
  _createdAt,
  title,
  slug,
  year,
  filterItem,
  clusterShape,
  clusterColor,
  counterNodeColor,
  normalNodeColor,
  ghostNodeColor,
  medium,
  credits,
  tags,
  gallery[]{
    _key,
    _type,
    caption,
    alt,
    url,
    asset,
    "assetCreatedAt": asset->_createdAt,
    poster{
      asset,
      alt
    },
    "posterAssetCreatedAt": poster.asset->_createdAt
  }
}`;

function sanityImageUrl(ref, projectId = SANITY_PROJECT_ID || LEGACY_SANITY_PROJECT_ID, dataset = SANITY_DATASET || LEGACY_SANITY_DATASET) {
  const match = ref?.match(/^(image)-(.+)-(\d+x\d+)-(\w+)$/);

  if (!match) {
    return "/img/ella_default.png";
  }

  const [, , id, dimensions, extension] = match;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${extension}`;
}

function imageRefFromItem(item) {
  return item?.asset?._ref || item?.asset?._id || item?.asset?.asset?._ref;
}

function imageRefFromImage(image) {
  return image?.asset?._ref || image?.asset?._id || image?.asset?.asset?._ref;
}

function normalizeFilterItem(value) {
  return FILTER_ITEM_ALIASES[value] || value || "";
}

function normalizeGalleryItem(item, index, source = {}) {
  const imageRef = imageRefFromItem(item);
  const posterRef = imageRefFromImage(item?.poster);
  const uploadedAt = item?.assetCreatedAt || item?.posterAssetCreatedAt || item?.uploadedAt || source.projectCreatedAt || "";
  const sourceOrder = source.projectIndex * 10000 + index;

  if (item?.imageUrl) {
    return {
      type: "image",
      title: item.title || item.caption || `IMG_${String(index + 1).padStart(4, "0")}`,
      imageUrl: item.imageUrl,
      alt: item.alt || item.title || item.caption || "",
      uploadedAt,
      sourceOrder
    };
  }

  if (item?._type === "imageWithCaption" && imageRef) {
    return {
      type: "image",
      title: item.caption || `IMG_${String(index + 1).padStart(4, "0")}`,
      imageUrl: sanityImageUrl(imageRef, source.projectId, source.dataset),
      alt: item.caption || "",
      uploadedAt,
      sourceOrder
    };
  }

  if (item?._type === "vimeoVideo" && item.url) {
    return {
      type: "video",
      title: item.caption || "Video",
      url: item.url,
      imageUrl: posterRef ? sanityImageUrl(posterRef, source.projectId, source.dataset) : "/img/ella_default.png",
      alt: item.poster?.alt || item.caption || "Video poster",
      uploadedAt,
      sourceOrder
    };
  }

  return null;
}

export function normalizeProjects(rawProjects = [], source = {}) {
  const projects = rawProjects
    .filter((project) => !HIDDEN_PROJECT_TITLES.has(project.title))
    .map((project, projectIndex) => {
      const media = (project.gallery || project.images || [])
        .map((item, index) =>
          normalizeGalleryItem(item, index, {
            ...source,
            projectCreatedAt: project._createdAt || project.createdAt || "",
            projectIndex
          })
        )
        .filter(Boolean);

      const images = media.filter((item) => item.type === "image");

      return {
        id: project._id || project.id || project.slug?.current || project.title,
        title: project.title || "Untitled",
        year: project.year || "",
        filterItem: normalizeFilterItem(project.filterItem || project.category || project.tags?.[0] || project.title),
        clusterShape: project.clusterShape || project.shape || "bow",
        clusterColor: project.clusterColor || project.color || "",
        counterNodeColor: project.counterNodeColor || "",
        normalNodeColor: project.normalNodeColor || "",
        ghostNodeColor: project.ghostNodeColor || "",
        medium: project.medium || "",
        credits: project.credits || "",
        tags: project.tags || [],
        media,
        images
      };
    })
    .filter((project) => project.media.length > 0);

  const mediaItems = projects.flatMap((project) => project.media);
  mediaItems
    .slice()
    .sort((a, b) => {
      const aTime = Date.parse(a.uploadedAt) || 0;
      const bTime = Date.parse(b.uploadedAt) || 0;

      if (aTime !== bTime) {
        return aTime - bTime;
      }

      return (a.sourceOrder || 0) - (b.sourceOrder || 0);
    })
    .forEach((item, index) => {
      item.globalIndex = index + 1;
    });

  return projects;
}

function hasCategoryProject(projects = [], category) {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, " ");

  return projects.some((project) => {
    const values = [project.filterItem, project.title, project.medium, ...(project.tags || [])]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ");

    return values.includes(normalizedCategory);
  });
}

function withFillerProjects(projects = []) {
  const fillerProjects = FILLER_PROJECTS.flatMap(({ category, id }) => {
    if (hasCategoryProject(projects, category)) {
      return [];
    }

    return normalizeProjects(fallbackProjects.filter((project) => project._id === id));
  });

  return [...fillerProjects, ...projects];
}

async function loadFromOwnedSanity() {
  if (!SANITY_PROJECT_ID || SANITY_PROJECT_ID === "your_project_id") {
    return [];
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2025-02-19",
    useCdn: false
  });

  const result = await client.fetch(PROJECTS_QUERY);
  return normalizeProjects(result, {
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET
  });
}

async function loadFromLegacyProxy() {
  const response = await fetch(CONTENT_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Content request failed: ${response.status}`);
  }

  const data = await response.json();
  return normalizeProjects(data.result, {
    projectId: LEGACY_SANITY_PROJECT_ID,
    dataset: LEGACY_SANITY_DATASET
  });
}

export async function loadProjects() {
  try {
    const ownedProjects = await loadFromOwnedSanity();

    if (ownedProjects.length > 0) {
      return ownedProjects;
    }
  } catch (error) {
    console.warn("Could not load owned Sanity project.", error);
  }

  try {
    const legacyProjects = await loadFromLegacyProxy();

    if (legacyProjects.length > 0) {
      return legacyProjects;
    }
  } catch (error) {
    console.warn("Could not load legacy content proxy.", error);
  }

  return withFillerProjects(normalizeProjects(fallbackProjects));
}
