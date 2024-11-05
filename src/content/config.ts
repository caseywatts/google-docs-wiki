import {z, defineCollection } from "astro:content";

// https://astro.build/config
const docs = defineCollection({
  editUrl: z.string()
});
export const collections = { docs };
