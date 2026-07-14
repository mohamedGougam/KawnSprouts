/** Diorama world units — character height ~0.75 */
export const DIORAMA_FLOOR_W = 5.2;
export const DIORAMA_FLOOR_D = 4.4;
export const DIORAMA_WALL_H = 2.4;
export const DIORAMA_DOME_R = 3.1;

/** Dollhouse orthographic camera — frustum fit handled in InteriorCamera.tsx */
export const CAMERA_POS = { x: 5.2, y: 5.4, z: 5.2 };
export const CAMERA_LOOK = { x: 0, y: 0.65, z: -0.1 };

/** Character sizing inside the diorama (world units ≈ 0.72 tall) */
export const INTERIOR_CHARACTER_HEIGHT = 0.72;
export const INTERIOR_MARKER_DISTANCE = 21;
export const INTERIOR_MARKER_SCALE = 0.5;
export const INTERIOR_SHADOW_RADIUS = 0.14;

/** Canvas render scale — sharper on retina / when the view fills the screen */
export const INTERIOR_DPR_MIN = 1.5;
export const INTERIOR_DPR_MAX = 2.5;
