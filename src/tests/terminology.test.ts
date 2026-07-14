import { describe, it, expect } from 'vitest';
import {
  TERMINOLOGY,
  myKawniee,
  yourKawniee,
  nameYourKawniee,
  meetFirstKawniee,
  waterYourKawniee,
  forKawnieesWho,
} from '../config/terminology';

describe('Kawniee terminology', () => {
  it('defines official species names', () => {
    expect(TERMINOLOGY.species.singular).toBe('Kawniee');
    expect(TERMINOLOGY.species.plural).toBe('Kawniees');
    expect(TERMINOLOGY.world.name).toBe('Sprout Hollow');
    expect(TERMINOLOGY.product.name).toBe('Kawn Sprouts');
  });

  it('includes canonical species definition', () => {
    expect(TERMINOLOGY.definition).toContain('Kawniees are tiny, kind-hearted creatures');
    expect(TERMINOLOGY.definition).toContain('Sprout Hollow');
  });

  it('provides copy helpers', () => {
    expect(myKawniee()).toBe('My Kawniee');
    expect(yourKawniee()).toBe('your Kawniee');
    expect(nameYourKawniee()).toBe('Name your Kawniee');
    expect(meetFirstKawniee()).toBe('Meet your first Kawniee.');
    expect(waterYourKawniee()).toBe('Water your Kawniee');
    expect(forKawnieesWho('love adventures')).toBe('For Kawniees who love adventures');
  });
});
