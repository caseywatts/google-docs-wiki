import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import lit from '@astrojs/lit';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), lit(), mdx(), sitemap()]
});