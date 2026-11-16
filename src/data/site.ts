/** Site-wide routes and external links. Use these instead of hard-coding paths. */
export const routes = {
  home: '/',
  howItWorks: '/how-it-works',
  universities: '/universities',
  hecvat: '/universities/hecvat',
  partners: '/partners',
  team: '/team',
  faq: '/faq',
  contact: '/contact',
  bookDemo: '/book-demo',
  privacy: '/privacy',
  terms: '/terms',
  subprocessors: '/subprocessors',
} as const;

export const external = {
  blog: 'https://isabellakulstad.substack.com/',
  about: 'https://www.cloud-ix.com/about',
  careers: 'https://www.cloud-ix.com/hiring',
  quickExit: 'https://www.google.com',
} as const;

export const hotline = { label: '800-656-4673', tel: 'tel:18006564673' } as const;

export const mainNav = [
  { label: 'How it works', href: routes.howItWorks },
  { label: 'For universities', href: routes.universities },
  { label: 'Partners', href: routes.partners },
  { label: 'Blog', href: external.blog },
];

export const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: routes.howItWorks },
      { label: 'For universities', href: routes.universities },
      { label: 'FAQ', href: routes.faq },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: external.about },
      { label: 'Meet the team', href: routes.team },
      { label: 'Partners', href: routes.partners },
      { label: 'Careers', href: external.careers },
      { label: 'Blog', href: external.blog },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: routes.privacy },
      { label: 'Terms', href: routes.terms },
      { label: 'Subprocessors', href: routes.subprocessors },
      { label: 'Contact', href: routes.contact },
    ],
  },
];
