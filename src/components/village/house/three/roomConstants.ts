/** Diorama world units — character height ~0.75 */
export const DIORAMA_FLOOR_W = 5.8;
export const DIORAMA_FLOOR_D = 5.0;
export const DIORAMA_WALL_H = 2.45;
export const DIORAMA_DOME_R = 2.35;

/** Dollhouse orthographic camera — frustum fit handled in InteriorCamera.tsx */
export const CAMERA_POS = { x: 4.8, y: 4.6, z: 4.8 };
export const CAMERA_LOOK = { x: 0, y: 0.55, z: 0.12 };

/** Character sizing inside the diorama (world units ≈ 0.72 tall) */
export const INTERIOR_CHARACTER_HEIGHT = 0.72;
export const INTERIOR_MARKER_DISTANCE = 13.5;
export const INTERIOR_MARKER_SCALE = 0.62;
export const INTERIOR_FLOOR_CLICK_RADIUS = 2.75;
export const INTERIOR_SHADOW_RADIUS = 0.14;

/** Canvas render scale — sharper on retina / when the view fills the screen */
export const INTERIOR_DPR_MIN = 1.5;
export const INTERIOR_DPR_MAX = 2.5;
