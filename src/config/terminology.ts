/**
 * Official Kawn Sprouts terminology — single source of truth for user-facing copy.
 * Internal code may still use `Sprout` types for the player creature model.
 */

export const TERMINOLOGY = {
  species: {
    singular: 'Kawniee',
    plural: 'Kawniees',
    possessiveSingular: 'Kawniee\u2019s',
    possessivePlural: 'Kawniees\u2019',
  },
  world: {
    name: 'Sprout Hollow',
  },
  product: {
    name: 'Kawn Sprouts',
    tagline: 'Grow happiness together.',
  },
  definition:
    'Kawniees are tiny, kind-hearted creatures who live in Sprout Hollow. Every Kawniee has a unique personality and grows through care, friendship, curiosity, and joyful adventures.',
} as const;

/** "your Kawniee" */
export function yourKawniee(lower = false): string {
  const label = `your ${TERMINOLOGY.species.singular}`;
  return lower ? label : label;
}

/** "My Kawniee" */
export function myKawniee(): string {
  return `My ${TERMINOLOGY.species.singular}`;
}

/** "Name your Kawniee" */
export function nameYourKawniee(): string {
  return `Name your ${TERMINOLOGY.species.singular}`;
}

/** "Kawniee name" field label */
export function kawnieeNameLabel(): string {
  return `${TERMINOLOGY.species.singular} name`;
}

/** "Choose a Kawniee color" */
export function chooseKawnieeColor(): string {
  return `Choose a ${TERMINOLOGY.species.singular} color`;
}

/** "{name} — your Kawniee" */
export function namedYourKawniee(name: string): string {
  return `${name} \u2014 your ${TERMINOLOGY.species.singular}`;
}

/** "Water your Kawniee" */
export function waterYourKawniee(): string {
  return `Water ${yourKawniee()}`;
}

/** "Tap your Kawniee" */
export function tapYourKawniee(): string {
  return `Tap ${yourKawniee()}`;
}

/** "Meet your first Kawniee." */
export function meetFirstKawniee(): string {
  return `Meet your first ${TERMINOLOGY.species.singular}.`;
}

/** "Every Kawniee is different." */
export function everyKawnieeDifferent(): string {
  return `Every ${TERMINOLOGY.species.singular} is different.`;
}

/** "Care for your Kawniee." */
export function careForYourKawniee(): string {
  return `Care for ${yourKawniee()}.`;
}

/** "Explore Sprout Hollow with your Kawniee." */
export function exploreWithKawniee(): string {
  return `Explore ${TERMINOLOGY.world.name} with ${yourKawniee()}.`;
}

/** "Visit other Kawniees in Sprout Hollow." */
export function visitOtherKawniees(): string {
  return `Visit other ${TERMINOLOGY.species.plural} in ${TERMINOLOGY.world.name}.`;
}

/** "For Kawniees who take snacks very seriously." */
export function forKawnieesWho(phrase: string): string {
  return `For ${TERMINOLOGY.species.plural} who ${phrase}`;
}

/** aria-label suffix: ", your Kawniee" */
export function ariaYourKawniee(): string {
  return `, ${yourKawniee()}`;
}
