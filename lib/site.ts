// Central place for organisation contact details + social links. Leave a field empty
// (the default) and the footer renders a "not available yet" placeholder instead of a
// link — fill these in when the real info exists.

export type SiteConfig = {
  email: string; // e.g. "info@syrianbusinessgateway.org"
  phone: string; // e.g. "+963 11 000 0000"
  location: string; // e.g. "Damascus, Syria"
  social: { linkedin: string; x: string; instagram: string }; // profile URLs
};

export const SITE: SiteConfig = {
  email: "",
  phone: "",
  location: "",
  social: {
    linkedin: "",
    x: "",
    instagram: "",
  },
};

export type SocialKey = keyof typeof SITE.social;
