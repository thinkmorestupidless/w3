import { parse } from 'yaml';
import raw from '../../families.yaml?raw';

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

type FamiliesFile = { owner: string; families: Array<Partial<Family> & { slug: string; name: string }> };

const file = parse(raw) as FamiliesFile;

export const owner: string = file.owner;

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

/** Topic that claims a repository for a family, e.g. `family-ankka`. */
export const familyTopic = (slug: string): string => `family-${slug}`;
