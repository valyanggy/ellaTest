import { fallbackProjects } from "./fallbackData";
import { createClient } from "@sanity/client";

const CONTENT_ENDPOINT = "https://alex_is_disconnected-ella_burgess.web.val.run/";
const LEGACY_SANITY_PROJECT_ID = "hsvfeudq";
const LEGACY_SANITY_DATASET = "ella-burgess";
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || "production";

const PROJECTS_QUERY = `*[_type == "post" && !(_id in path("drafts.**"))] | order(year desc, title asc) {
  _id,
  title,
  slug,
  year,
  medium,
  credits,
  tags,
  gallery[]{
    _key,
    _type,
    caption,
    alt,
    url,
    asset
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
  return item?.asset?._ref || item?.asset?.asset?._ref;
}

function normalizeGalleryItem(item, index, source = {}) {
  const imageRef = imageRefFromItem(item);

  if (item?._type === "imageWithCaption" && imageRef) {
    return {
      type: "image",
      title: item.caption || `IMG_${String(index + 1).padStart(4, "0")}`,
      imageUrl: sanityImageUrl(imageRef, source.projectId, source.dataset),
      alt: item.caption || ""
    };
  }

  if (item?._type === "vimeoVideo" && item.url) {
    return {
      type: "video",
      title: item.caption || "Video",
      url: item.url
    };
  }

  return null;
}

export function normalizeProjects(rawProjects = [], source = {}) {
  return rawProjects
    .map((project) => {
      const media = (project.gallery || project.images || [])
        .map((item, index) => normalizeGalleryItem(item, index, source))
        .filter(Boolean);

      const images = media.filter((item) => item.type === "image");

      return {
        id: project._id || project.id || project.slug?.current || project.title,
        title: project.title || "Untitled",
        year: project.year || "",
        medium: project.medium || "",
        tags: project.tags || [],
        media,
        images
      };
    })
    .filter((project) => project.images.length > 0);
}

async function loadFromOwnedSanity() {
  if (!SANITY_PROJECT_ID || SANITY_PROJECT_ID === "your_project_id") {
    return [];
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2025-02-19",
    useCdn: true
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

  return fallbackProjects;
}
