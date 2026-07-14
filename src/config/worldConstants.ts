/** Premium cozy-world constants */
export const WORLD_SIZE = 3600;

export const COZY_CAMERA_ZOOM = 2.4;
export const CAMERA_ZOOM_MIN = 1.0;
export const CAMERA_ZOOM_MAX = 2.8;

/** Player sprite ~52px tall; at 2.4 zoom ≈ 10% of ~1250px viewport height */
export const PLAYER_SCREEN_HEIGHT_RATIO = 0.1;

export const CHUNK_SIZE = 600;
export const TILE_SIZE = 48;
export const CHUNK_LOAD_MARGIN = 1;

export const CAMERA_FOLLOW_LAG = 0.065;
export const CAMERA_SETTLE_LAG = 0.04;
export const CAMERA_ANTICIPATION = 28;
export const CAMERA_VERTICAL_OFFSET = -40;

export const WALK_SPEED_PX = 4.2;
export const BOAT_SPEED_PX = 3.6;
export const BIKE_SPEED_PX = WALK_SPEED_PX * 1.6;

/** Player Kawniee scale while walking/riding (1 = idle size) */
export const PLAYER_MOTION_SCALE = 0.72;

/** Scale factor from legacy 2400px world saves */
export const LEGACY_WORLD_SIZE = 2400;
export const WORLD_SCALE = WORLD_SIZE / LEGACY_WORLD_SIZE;
