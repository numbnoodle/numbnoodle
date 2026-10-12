/**
 * Stroke icons (24×24, round caps). Shared by Astro and React so both
 * draw the same hand. The fonts' Latin subsets have no arrow glyphs, so
 * every arrow on the site comes from here.
 */
export const icons = {
  'arrow-right': 'M4 12h15M13.5 6.5 19 12l-5.5 5.5',
  'arrow-up-right': 'M7 17 17 7M8.5 7H17v8.5',
  'arrow-down': 'M12 4v15M6.5 13.5 12 19l5.5-5.5',
  check: 'M4.5 12.5l5 5L19.5 7',
  command:
    'M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3',
  download: 'M12 4v11M7 10.5l5 5 5-5M5 20h14',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  copy: 'M9 9h11v11H9zM5.5 15H4V4h11v1.5',
  mail: 'M3 6h18v12H3zM3.5 6.5 12 13l8.5-6.5',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14zM20 20l-4-4',
  close: 'M6 6l12 12M18 6 6 18',
  // hats
  founder: 'M6 21V3.5M6 4.5l13 4.25L6 13M3 21h7',
  designer: 'M4 18C7 5 16 20 20 6M4 18 9.5 6M20 6l-5.5 13',
  engineer: 'M8 7 3 12l5 5M16 7l5 5-5 5M14 4.5l-4 15',
  growth: 'M3 19.5c3.5 0 4.5-6 7.5-6s3 3.5 6-.5 3.5-8 3.5-8M14.5 5H20v5.5',
  noodle: 'M3.5 18v-6.5a3.25 3.25 0 0 1 6.5 0v2.25a2 2 0 0 0 4 0V11.5a3.25 3.25 0 0 1 6.5 0V18',
} as const;

export type IconName = keyof typeof icons;
