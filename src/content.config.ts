import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    clientDetail: z.string(),
    role: z.string(),
    period: z.string(),
    teaser: z.string(),
    tag: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
