import { defineField, defineType } from "sanity";

export const imageWithCaption = defineType({
  name: "imageWithCaption",
  title: "Image",
  type: "image",
  options: {
    hotspot: true
  },
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      type: "string"
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Short visual description for accessibility."
    })
  ],
  preview: {
    select: {
      title: "caption",
      media: "asset"
    },
    prepare({ title, media }) {
      return {
        title: title || "Untitled image",
        media
      };
    }
  }
});
