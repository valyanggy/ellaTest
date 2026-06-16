import { defineField, defineType } from "sanity";

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
