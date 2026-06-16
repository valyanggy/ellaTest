import fs from "node:fs/promises";

const legacyResponsePath = "/tmp/ella-sanity-response.json";
const outputPath = new URL("../import/ella-import.ndjson", import.meta.url);

function toSlug(input) {
  return String(input || "untitled")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function remoteSanityAssetUrl(ref) {
  const match = ref?.match(/^(image)-(.+)-(\d+x\d+)-(\w+)$/);

  if (!match) {
    return null;
  }

  const [, , id, dimensions, extension] = match;
  return `https://cdn.sanity.io/images/hsvfeudq/ella-burgess/${id}-${dimensions}.${extension}`;
}

function normalizeGalleryItem(item) {
  if (item?._type === "imageWithCaption" && item.asset?._ref) {
    const assetUrl = remoteSanityAssetUrl(item.asset._ref);

    if (!assetUrl) {
      return null;
    }

    return {
      _key: item._key,
      _type: "imageWithCaption",
      caption: item.caption,
      asset: {
        _type: "reference",
        _sanityAsset: `image@${assetUrl}`
      }
    };
  }

  if (item?._type === "vimeoVideo" && item.url) {
    return {
      _key: item._key,
      _type: "vimeoVideo",
      caption: item.caption,
      url: item.url
    };
  }

  return null;
}

const legacy = JSON.parse(await fs.readFile(legacyResponsePath, "utf8"));
const documents = (legacy.result || []).map((project) => ({
  _id: project._id,
  _type: "post",
  title: project.title,
  slug: project.slug || { _type: "slug", current: toSlug(project.title) },
  year: project.year,
  medium: project.medium,
  credits: project.credits,
  tags: project.tags,
  gallery: (project.gallery || []).map(normalizeGalleryItem).filter(Boolean)
}));

await fs.mkdir(new URL("../import", import.meta.url), { recursive: true });
await fs.writeFile(outputPath, `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`);
console.log(`Wrote ${documents.length} documents to ${outputPath.pathname}`);
