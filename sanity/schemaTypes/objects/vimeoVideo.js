import { defineField, defineType } from "sanity";

export const vimeoVideo = defineType({
  name: "vimeoVideo",
  title: "Vimeo video",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      type: "string"
    }),
    defineField({
      name: "url",
      title: "Vimeo URL",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] })
    }),
    defineField({
      name: "poster",
      title: "Poster",
      type: "image",
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Short visual description for accessibility."
        })
      ],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: "caption",
      subtitle: "url"
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Vimeo video",
        subtitle
      };
    }
  }
});
