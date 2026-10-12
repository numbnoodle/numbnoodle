/**
 * numbnoodle.com: every word, number and link on the site lives here.
 *
 * Edit this file to change copy. Components only render what's in here.
 * Rule of the house: every claim must be true. P2P.me numbers are company
 * outcomes (the team I helped build), Coins.me numbers are mine.
 *
 * Anything marked `todo` renders as a visible "TODO(gaurav)" sticky note
 * while `flags.showTodoNotes` is true. Fill them in, then flip the flag.
 */

export type HatId = 'founder' | 'designer' | 'engineer' | 'growth';

export interface Hat {
  id: HatId;
  label: string;
  /** Sub-headline shown when this hat is on. */
  line: string;
  /** Small mono "proof" line under it. */
  proof: string;
}

export interface Metric {
  /** Number the ticker counts up to. */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface CaseSection {
  id: string;
  title: string;
  /** Paragraphs of copy. Keep them factual. */
  body: string[];
  /** Bullet points, optional. */
  points?: string[];
  /** What's missing. Renders as a TODO note. */
  todo?: string;
  /** Image placeholders. Drop files in /public/work and set `src`. */
  images?: { src?: string; alt: string; todo: string }[];
}

export interface Project {
  slug: 'coins-me' | 'p2p-me';
  name: string;
  url: string;
  urlLabel: string;
  role: string;
  period?: string;
  pitch: string;
  /** Shown when the pitch still needs Gaurav's words. */
  pitchTodo?: string;
  accent: 'lime' | 'tomato';
  /** Who assembled it. Printed on the box. */
  assembledBy: string;
  /** App screenshot for the launch card. Drop a file in /public/work and set `src`. */
  screenshot: { src?: string; alt: string; todo: string };
  metrics: Metric[];
  metricsLabel: string;
  metricsNote?: string;
  hats: string[];
  caseStudy: CaseSection[];
}

export interface EarlierRole {
  company: string;
  role: string;
  place: string;
  period: string;
  summary: string;
}

export interface Station {
  id: string;
  name: string;
  verb: string;
  what: string;
  proof: string;
}

export interface StickerGroup {
  id: 'build' | 'design' | 'ship' | 'grow';
  label: string;
  items: string[];
}

export interface Principle {
  title: string;
  body: string;
}

export const flags = {
  /** Visible TODO notes on the site. Set to false once you've filled them in. */
  showTodoNotes: true,
};

export const person = {
  name: 'Gaurav Pawar',
  handle: 'numbnoodle',
  role: 'Founder & founding engineer',
  location: 'Hyderabad, India',
  locationShort: 'Hyderabad, IN',
  timeZone: 'Asia/Kolkata',
  summary:
    'I take products from idea to design, code, deployment and growth. I’ve done it on a three-person founding team that scaled internationally, and solo as a founder.',
  photo: {
    src: '' as string, // TODO: Gaurav to add, e.g. '/me.webp'
    alt: 'Gaurav Pawar',
  },
};

export const links = {
  email: 'gauravpawar3102@gmail.com',
  github: 'https://github.com/numbnoodle',
  linkedin: 'https://www.linkedin.com/in/gaurav-9b1655198',
  x: 'https://x.com/numbnoodlee',
  resume: '/resume.pdf',
  coins: 'https://app.coins.me',
  p2p: 'https://p2p.me',
};

export const seo = {
  siteUrl: 'https://numbnoodle.com',
  title: 'Gaurav Pawar (numbnoodle): founder & founding engineer',
  description:
    'Gaurav Pawar takes products from idea to design, code, deployment and growth. Founder of Coins.me, founding engineer at P2P.me. Based in Hyderabad, India.',
  ogTitle: 'I take products from 0 → 1 → 250K.',
  ogSub: 'Gaurav Pawar · founder & founding engineer · numbnoodle.com',
  themeColorLight: '#F2EDE3',
  themeColorDark: '#141311',
};

export const nav = [
  { label: 'Work', href: '/#shipped' },
  { label: 'Pipeline', href: '/#pipeline' },
  { label: 'Toolbox', href: '/#toolbox' },
  { label: 'Manual', href: '/#manual' },
  { label: 'Contact', href: '/#contact' },
];

export const hero = {
  status: {
    label: 'currently',
    text: 'building coins.me · open to founding-team roles',
  },
  /** Headline pieces. The arrows between them are drawn as noodles. */
  headline: {
    lead: 'I take products from',
    steps: ['0', '1', '250K'],
    footnoteMark: '*',
  },
  footnote:
    'P2P.me’s 250K users, built with the three-person founding team I was part of. Now I’m doing it solo at Coins.me.',
  hatsPrompt: 'Which hat do you need?',
  hats: [
    {
      id: 'founder',
      label: 'Founder',
      line: 'I run Coins.me solo: research, roadmap, product, code and growth. One person, the whole company.',
      proof: 'coins.me · ~5K MAU · ~500 DAU',
    },
    {
      id: 'designer',
      label: 'Designer',
      line: 'I designed the P2P.me app’s UX flows and UI, and Coins.me’s end to end. Then I build exactly what I drew.',
      proof: 'figma · ux flows · wireframes · ui',
    },
    {
      id: 'engineer',
      label: 'Engineer',
      line: 'Full stack, end to end: frontend, backend APIs and the data layer, deployed to production and kept alive there.',
      proof: 'react · node · hono · postgres · cloudflare',
    },
    {
      id: 'growth',
      label: 'Growth',
      line: 'Distribution is part of the build: campaigns across multiple countries at P2P.me, a creator launch playbook and region-specific campaigns for Coins.me 2.0.',
      proof: 'creator playbook · video briefs · campaigns',
    },
  ] satisfies Hat[],
  ctas: {
    primary: { label: 'See what I’ve shipped', href: '#shipped' },
    secondary: { label: 'Get in touch', href: '#contact' },
    resume: { label: 'Download resume', href: '/resume.pdf' },
  },
};

export const pipeline = {
  kicker: 'The noodle pipeline',
  /** The five words of the title are the station names, joined by noodles. */
  intro: 'Most startups pass work down a line of people. I am the line. One noodle, no handoffs.',
  stations: [
    {
      id: 'idea',
      name: 'Idea',
      verb: 'figure out what to build',
      what: 'User and market research, product direction, the roadmap.',
      proof: 'Coins.me: research for markets with currency instability',
    },
    {
      id: 'design',
      name: 'Design',
      verb: 'make it make sense',
      what: 'UX flows and UI in Figma, wireframes first.',
      proof: 'Designed the P2P.me app and Coins.me end to end',
    },
    {
      id: 'code',
      name: 'Code',
      verb: 'build the whole thing',
      what: 'Frontend, backend APIs and the data layer.',
      proof: 'React · Node · Hono · Prisma · Postgres (Neon)',
    },
    {
      id: 'ship',
      name: 'Ship',
      verb: 'get it live, keep it live',
      what: 'Deployment, releases and production maintenance.',
      proof: 'Cloudflare · AWS · Netlify',
    },
    {
      id: 'grow',
      name: 'Grow',
      verb: 'get it used',
      what: 'Campaigns, creator launch playbooks and video briefs.',
      proof: 'Coins.me 2.0 launch · P2P.me campaigns in multiple countries',
    },
  ] satisfies Station[],
};

export const projects: Project[] = [
  {
    slug: 'coins-me',
    name: 'Coins.me',
    url: 'https://app.coins.me',
    urlLabel: 'app.coins.me',
    role: 'Founder · Product, Engineering & Growth',
    period: 'Now · solo',
    pitch:
      'A progressive web app that helps people in markets with currency instability save and spend in dollars.',
    accent: 'lime',
    assembledBy: 'Assembled by 1 human in Hyderabad',
    screenshot: {
      // src: '/work/coins-me-home.webp',
      alt: 'Coins.me app on a phone',
      todo: 'Coins.me app screenshot, portrait (e.g. 1080×2340) → /public/work/coins-me-home.webp',
    },
    metrics: [
      { value: 5, prefix: '~', suffix: 'K', label: 'monthly active users' },
      { value: 500, prefix: '~', label: 'daily active users' },
    ],
    metricsLabel: 'my numbers · global',
    hats: ['Research', 'Roadmap', 'UX/UI', 'Frontend', 'Backend', 'Data', 'Deploys', 'Growth'],
    caseStudy: [
      {
        id: 'problem',
        title: 'The problem',
        body: [
          'In markets with currency instability, holding your money in the local currency is a bet you didn’t choose to make. Coins.me is a progressive web app that helps people in those markets save and spend in dollars.',
        ],
        todo: 'Add the specific markets, the user you met in research, and why existing options weren’t good enough.',
      },
      {
        id: 'role',
        title: 'My role',
        body: [
          'Founder, solo. I own it end to end: user and market research, product direction and roadmap, UX flows and UI, the full stack (frontend, backend APIs, data layer), deployment and releases, and growth.',
        ],
        points: ['Product', 'Engineering', 'Growth', 'Research', 'Design'],
      },
      {
        id: 'designed',
        title: 'What I designed',
        body: ['The UX flows and UI for the whole app.'],
        todo: 'Add 2–3 key flows (e.g. onboarding, saving, spending) and a before/after or wireframe → UI shot.',
        images: [
          { alt: 'Coins.me key flow in Figma', todo: 'Figma flow screenshot' },
          { alt: 'Coins.me home screen on a phone', todo: 'App screenshot (PWA on a phone)' },
        ],
      },
      {
        id: 'built',
        title: 'What I built',
        body: [
          'The full stack: the PWA frontend, the backend APIs and the data layer, built and maintained by one person.',
        ],
        todo: 'Name the actual stack used for Coins.me (from your toolbox) and one hard technical problem you solved.',
      },
      {
        id: 'shipped',
        title: 'How it shipped',
        body: ['I run deployment and releases myself. It’s live at app.coins.me.'],
        todo: 'Add your release cadence and how you ship safely without a team.',
      },
      {
        id: 'grew',
        title: 'How it grew',
        body: [
          'Coins.me has ~5K monthly active users and ~500 daily active users, globally.',
          'I planned the Coins.me 2.0 launch: a creator launch playbook, video briefs, and region-specific marketing and app campaigns.',
        ],
        points: ['Creator launch playbook', 'Video briefs', 'Region-specific marketing campaigns', 'Region-specific app campaigns'],
        todo: 'Add which regions, which channels worked, and a growth chart if you can share one.',
      },
      {
        id: 'learned',
        title: 'What I learned',
        body: [],
        todo: 'In your words: what did running every function solo teach you? What would you do differently?',
      },
    ],
  },
  {
    slug: 'p2p-me',
    name: 'P2P.me',
    url: 'https://p2p.me',
    urlLabel: 'p2p.me',
    role: 'Founding Engineer · 1 of 3 on the founding team',
    period: 'Jun 2023 – Sep 2026',
    pitch:
      'Taken from an early-stage idea to a live platform by a founding team of three: me and two co-founders.',
    pitchTodo: 'Add a one-line description of what P2P.me does.',
    accent: 'tomato',
    assembledBy: 'Assembled by a founding team of 3',
    screenshot: {
      // src: '/work/p2p-me-home.webp',
      alt: 'P2P.me app on a phone',
      todo: 'P2P.me app screenshot, portrait (e.g. 1080×2340) → /public/work/p2p-me-home.webp',
    },
    metrics: [
      { value: 250, suffix: 'K', label: 'users' },
      { value: 30, suffix: 'K+', label: 'monthly active users' },
      { value: 60, prefix: '$', suffix: 'M+', label: 'cumulative volume' },
      { value: 15, suffix: '+', label: 'countries' },
    ],
    metricsLabel: 'company metrics',
    metricsNote: 'the team I helped build',
    hats: ['UX/UI', 'Frontend', 'Backend', 'Deploys', 'Prod maintenance', 'Distribution'],
    caseStudy: [
      {
        id: 'problem',
        title: 'The problem',
        body: [],
        todo: 'Describe the problem P2P.me solves and who it’s for.',
      },
      {
        id: 'role',
        title: 'My role',
        body: [
          'Founding engineer, one of three on the founding team alongside two co-founders. We built it from an early-stage idea into a live platform.',
          'I designed the app (UX flows and UI) and contributed hands-on from there: frontend and backend development, deployment and production maintenance.',
        ],
        points: ['Design', 'Frontend', 'Backend', 'Deployment', 'Production maintenance', 'Distribution'],
      },
      {
        id: 'designed',
        title: 'What I designed',
        body: ['The app’s UX flows and UI.'],
        todo: 'Add the core flows you designed and a screen or two.',
        images: [
          { alt: 'P2P.me app flow in Figma', todo: 'Figma flow screenshot' },
          { alt: 'P2P.me app screen', todo: 'App screenshot' },
        ],
      },
      {
        id: 'built',
        title: 'What I built',
        body: ['Hands-on frontend and backend development on the platform.'],
        todo: 'Name the parts of the system you built and the stack.',
      },
      {
        id: 'shipped',
        title: 'How it shipped',
        body: ['Deployment and production maintenance, keeping a live platform running as it grew.'],
        todo: 'Add a story about keeping production healthy as usage scaled.',
      },
      {
        id: 'grew',
        title: 'How it grew',
        body: [
          'I contributed to distribution and marketing campaigns across multiple countries.',
          'Company outcomes I was part of: 250K users, 30K+ monthly active users, $60M+ cumulative transaction volume, 15+ countries and ~$8M raised.',
        ],
        points: ['250K users', '30K+ MAU', '$60M+ cumulative volume', '15+ countries', '~$8M raised'],
        todo: 'Add which campaigns you worked on and what you did in them.',
      },
      {
        id: 'learned',
        title: 'What I learned',
        body: [],
        todo: 'In your words: what did going from idea to 250K users on a three-person founding team teach you?',
      },
    ],
  },
];

export const shipped = {
  kicker: 'Shipped',
  title: 'The case files.',
  intro: 'Two live products. One I’m building solo, one I helped build on a founding team of three. Go poke them.',
  earlierTitle: 'Earlier',
};

export const earlier: EarlierRole[] = [
  {
    company: 'EatX',
    role: 'Full-Stack Software Engineer',
    place: 'Bengaluru',
    period: 'Dec 2022 – Jun 2023',
    summary: 'React.js + Redux web apps, mobile projects with Ionic and Vue.js, and a hand in the UI/UX design.',
  },
  {
    company: 'FITPEO Inc.',
    role: 'Web Development Intern',
    place: 'Remote (Florida, USA)',
    period: 'Apr – Jun 2022',
    summary: 'Helped build new products from scratch under the CTO.',
  },
];

export const education = {
  degree: 'Bachelor’s, Computer Science and Engineering',
  school: 'Methodist College of Engineering & Technology, Hyderabad',
  period: '2019–2023',
};

export const toolbox = {
  kicker: 'Toolbox',
  title: 'The sticker sheet',
  intro: 'What’s on my laptop lid. No progress bars. If it’s here, I’ve shipped with it.',
  groups: [
    {
      id: 'build',
      label: 'Build',
      items: [
        'JavaScript', 'React', 'React Native', 'Vue', 'Redux', 'RTK Query', 'Tailwind',
        'Material UI', 'Styled Components', 'Node.js', 'Express', 'Hono', 'GraphQL',
        'Prisma', 'Mongoose', 'Solidity', 'Smart contracts',
      ],
    },
    {
      id: 'design',
      label: 'Design',
      items: ['Figma', 'UI/UX', 'User research', 'Wireframing'],
    },
    {
      id: 'ship',
      label: 'Ship',
      items: ['PostgreSQL (Neon)', 'MongoDB', 'Cloudflare', 'AWS', 'Netlify', 'Git', 'GitHub', 'Claude Code'],
    },
    {
      id: 'grow',
      label: 'Grow',
      items: ['Product strategy', 'Go-to-market', 'Amplitude'],
    },
  ] satisfies StickerGroup[],
};

export const manual = {
  kicker: 'How I work',
  title: 'The founder operating manual',
  revision: 'rev. 2026.10',
  principles: [
    {
      title: 'No handoffs. I design it, build it and ship it.',
      body: 'At Coins.me, research, roadmap, UI, APIs and releases all sit with one person. Nothing gets lost in translation because nothing gets translated.',
    },
    {
      title: 'Specs are optional. Ownership isn’t.',
      body: 'I own products end to end. The bar is the thing in production, not the doc that describes it.',
    },
    {
      title: 'Build for the market, not the demo.',
      body: 'Coins.me exists for people living with currency instability. Research in those markets comes before the roadmap.',
    },
    {
      title: 'If nobody uses it, it isn’t done.',
      body: 'Shipping is the halfway mark. About 500 people use Coins.me every day. That’s the number I watch.',
    },
    {
      title: 'Distribution is part of the product.',
      body: 'Creator playbooks, video briefs and regional campaigns ship alongside the features, not after them.',
    },
    {
      title: 'Ship it, then stay on call.',
      body: 'At P2P.me I didn’t just deploy, I maintained production. Live is a responsibility, not a finish line.',
    },
  ] satisfies Principle[],
};

export const contact = {
  kicker: 'Contact',
  title: 'Let’s build something.',
  intro:
    'Need a founding engineer who also designs, ships and does growth? I’m open to founding-team roles. Email is fastest.',
  copyLabel: 'click to copy',
  copiedLabel: 'copied',
};

export const footer = {
  version: 'v2026.10',
  builtWith: 'Astro, React & Tailwind',
};

export const notFound = {
  title: 'This page didn’t find product-market fit.',
  body: 'Zero users, zero retention. We’re pivoting you back to the homepage.',
};

export const consoleMessage = [
  'Hey, curious engineer.',
  'You opened devtools on a portfolio, which tells me you’re my kind of person.',
  `I'm open to founding-team roles. Say hi: ${'gauravpawar3102@gmail.com'}`,
  'Psst: press / or ⌘K, then try "noodle mode".',
];

export const site = {
  flags,
  person,
  links,
  seo,
  nav,
  hero,
  pipeline,
  shipped,
  projects,
  earlier,
  education,
  toolbox,
  manual,
  contact,
  footer,
  notFound,
  consoleMessage,
};

export default site;
