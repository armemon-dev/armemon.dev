export const experience = [
  {
    period: '2026 — PRESENT',
    title: 'Product Developer',
    company: 'Independent Products',
    description:
      'Design, build, ship and maintain WithinBench end to end: product direction, interface, the full Next.js implementation, hardened Cloudflare Workers, deployment and legal pages. Building, shipping and maintaining Titlania alongside it. Sole owner of both codebases and every decision in them.',
    tags: ['Product development', 'React', 'Next.js', 'TypeScript', 'Cloudflare'],
  },
  {
    period: 'APR 2024',
    title: 'React Native Developer',
    company: 'Independent Client Project',
    description:
      'Built and delivered a private Android business-management application for a confectionery and snacks distributor. Covered invoicing, customers, inventory, employees and salaries, assets and liabilities, cash and bank tracking, analytics, and performance. Implemented offline data management with Redux Toolkit plus complete backup and restore for moving data to another phone. A cross-platform release for Android and iOS is planned next.',
    tags: ['React Native CLI', 'Android', 'Redux Toolkit', 'Offline-first', 'Backup & restore'],
  },
]

export const projects = [
  {
    slug: 'withinbench',
    name: 'WithinBench',
    href: 'https://withinbench.com',
    image: '/withinbench-preview.webp',
    imageAlt: 'WithinBench browser workshop homepage showing private, account-free tools',
    status: 'LIVE',
    description:
      'A free browser workshop combining 119 focused utilities with six professional-document workflows. Supported files and drafts stay on the user’s device.',
    tags: ['Next.js', 'TypeScript', 'Browser-local', 'Cloudflare'],
  },
  {
    slug: 'titlania',
    name: 'Titlania',
    href: 'https://titlania.com',
    image: '/titlania-preview.webp',
    imageAlt: 'Titlania support-widget homepage showing live chat and instant answers',
    status: 'LIVE',
    description:
      'A support widget for websites that answers routine questions instantly in the visitor’s browser, then hands live chats and tickets to a human team with the context intact. Currently in free public beta.',
    tags: ['Support widget', 'Live chat', 'Browser-local', 'Cloudflare'],
  },
]
