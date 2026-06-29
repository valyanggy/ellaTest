import { defineField, defineType } from "sanity";
import { ColorStringInput } from "../components/ColorStringInput";

export const post = defineType({
  name: "post",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string"
    }),
    defineField({
      name: "filterItem",
      title: "Filter item",
      type: "string",
      options: {
        list: [
          { title: "2D work", value: "2D work" },
          { title: "Cakes", value: "Cakes" },
          { title: "House Lamp", value: "House Lamp" },
          { title: "Makeup Hair", value: "Makeup Hair" },
          { title: "Nailed.jpeg", value: "Nailed.jpeg" },
          { title: "Pics-Or-It-Didn't-Happen", value: "Pics-Or-It-Didn't-Happen" },
          { title: "Random", value: "Random" },
          { title: "Teeth", value: "Teeth" },
          { title: "Thesis Progress", value: "Thesis Progress" },
          { title: "Time Ripens All Things", value: "Time Ripens All Things" },
          { title: "Video Work", value: "Video Work" }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "clusterShape",
      title: "Cluster shape",
      type: "string",
      options: {
        list: [
          { title: "Bow", value: "bow" },
          { title: "Worm", value: "worm" },
          { title: "Flower", value: "flower" }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "counterNodeColor",
      title: "Counter node color",
      type: "string",
      description: "Hex color for the project/count node, e.g. #e5d70c.",
      components: { input: ColorStringInput },
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: "hex color",
          invert: false
        }).warning("Use a hex color like #e5d70c.")
    }),
    defineField({
      name: "normalNodeColor",
      title: "Normal node color",
      type: "string",
      description: "Hex color for media nodes.",
      components: { input: ColorStringInput },
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: "hex color",
          invert: false
        }).warning("Use a hex color like #e5d70c.")
    }),
    defineField({
      name: "ghostNodeColor",
      title: "Ghost node color",
      type: "string",
      description: "Hex color for unfilled ghost nodes.",
      components: { input: ColorStringInput },
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: "hex color",
          invert: false
        }).warning("Use a hex color like #e5d70c.")
    }),
    defineField({
      name: "medium",
      title: "Medium",
      type: "string"
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "text",
      rows: 3
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" }
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "imageWithCaption" }, { type: "vimeoVideo" }]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "gallery.0"
    }
  }
});
