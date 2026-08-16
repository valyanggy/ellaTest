import { CATEGORY_MEMBERS } from "../config/site";

const FILTER_ALIASES = {
  "oakwood photo series": "pics or it didn t happen"
};

function normalizeFilterValue(value) {
  const normalizedValue = String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return FILTER_ALIASES[normalizedValue] || normalizedValue;
}

export function projectMatchesCategory(project, category) {
  const categoryMembers = CATEGORY_MEMBERS[category] || [category];
  const normalizedMembers = categoryMembers.map(normalizeFilterValue);
  const searchableValues = [
    project.filterItem,
    project.title,
    project.medium,
    ...(project.tags || []),
    ...(project.media || []).map((item) => (item.type === "video" ? "Video Work" : ""))
  ].map(normalizeFilterValue);

  return normalizedMembers.some((member) =>
    searchableValues.some((value) => value === member || value.includes(member))
  );
}
