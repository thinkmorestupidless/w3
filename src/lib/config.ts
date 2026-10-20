import { parse } from 'yaml';
import raw from '../../w3.yaml?raw';

export type PrivateRepo = { name: string; description: string };

export type Family = {
  slug: string;
  name: string;
  label: string;
  thesis: string;
  colour: string;
  text: string;
  lite: string;
  deep: string;
  brain?: string;
  repos: string[];
  produced: string[];
  private: PrivateRepo[];
};

export type Link = { label: string; href: string };

export type Site = {
  owner: string;
  repo: string;
  url: string;
  domain?: string;
  title: string;
  wordmark: string;
  accent: string;
  intro?: string;
  description: string;
  nav: Link[];
  links: Link[];
};

type ConfigFile = { site: Site; families: Array<Partial<Family> & { slug: string; name: string }> };

const file = parse(raw) as ConfigFile;

export const site: Site = { nav: [], links: [], ...file.site };

export const owner: string = site.owner;

export const families: Family[] = file.families.map((f) => ({
  slug: f.slug,
  name: f.name,
  label: f.label ?? '',
  thesis: f.thesis ?? '',
  colour: f.colour ?? '#16181A',
  text: f.text ?? '#F4EFE3',
  lite: f.lite ?? '#F4EFE3',
  deep: f.deep ?? '#16181A',
  brain: f.brain,
  repos: f.repos ?? [],
  produced: f.produced ?? [],
  private: f.private ?? [],
}));

export const familyBySlug = (slug: string): Family | undefined => families.find((f) => f.slug === slug);
