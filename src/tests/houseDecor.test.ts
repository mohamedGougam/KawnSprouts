import { describe, expect, it } from 'vitest';
import { ADAM_HOUSE_SCENE } from '../config/interiorSceneConfig';
import { buildHouseInteriorProps } from '../services/houseDecorService';

const baseProps = ADAM_HOUSE_SCENE.props.filter((p) => p.type !== 'window');

describe('buildHouseInteriorProps', () => {
  it('hides gated decor until the matching cottage item is owned', () => {
    const props = buildHouseInteriorProps(baseProps, []);
    expect(props.some((p) => p.id === 'rug')).toBe(false);
    expect(props.some((p) => p.id === 'shelf')).toBe(false);
    expect(props.some((p) => p.id === 'chair')).toBe(true);
  });

  it('adds a visible second chair when extra-chair is owned', () => {
    const props = buildHouseInteriorProps(baseProps, ['extra-chair']);
    const ownedChair = props.find((p) => p.id === 'owned-chair-0');
    expect(ownedChair).toMatchObject({ type: 'chair', x: -0.45, z: 0.22 });
  });

  it('adds a table-top bear when wooden-toy is owned without a bookshelf', () => {
    const props = buildHouseInteriorProps(baseProps, ['wooden-toy']);
    const toy = props.find((p) => p.id === 'owned-toy');
    expect(toy).toMatchObject({ type: 'teddy', x: 0.48, y: 0.38, scale: 1.25 });
  });

  it('shows chair and bear together after both purchases', () => {
    const props = buildHouseInteriorProps(baseProps, ['extra-chair', 'wooden-toy']);
    expect(props.some((p) => p.id === 'owned-chair-0')).toBe(true);
    expect(props.some((p) => p.id === 'owned-toy')).toBe(true);
  });
});
