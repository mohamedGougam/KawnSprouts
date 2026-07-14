import { useLayoutEffect, useMemo } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_LOOK, CAMERA_POS } from './roomConstants';

/** World-space view volume that must fit on screen (room + roof + padding). */
export const SCENE_VIEW_WIDTH = 7.4;
export const SCENE_VIEW_HEIGHT = 5.6;

function fitOrthoToScene(camera: THREE.OrthographicCamera, width: number, height: number) {
  camera.position.set(CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z);
  camera.near = 0.1;
  camera.far = 80;
  camera.zoom = 1;

  const aspect = width / Math.max(height, 1);
  const pad = 1.08;
  const sceneW = SCENE_VIEW_WIDTH * pad;
  const sceneH = SCENE_VIEW_HEIGHT * pad;

  if (aspect >= sceneW / sceneH) {
    const h = sceneH;
    const w = h * aspect;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.left = -w / 2;
    camera.right = w / 2;
  } else {
    const w = sceneW;
    const h = w / aspect;
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
  }

  camera.updateProjectionMatrix();
}

/**
 * Orthographic camera sized in world units so the diorama fits the viewport.
 * `manual` prevents R3F from overwriting frustum with pixel dimensions.
 */
export function InteriorCameraRig() {
  const lookAt = useMemo(
    () => new THREE.Vector3(CAMERA_LOOK.x, CAMERA_LOOK.y, CAMERA_LOOK.z),
    [],
  );

  return (
    <OrthographicCamera makeDefault manual position={[CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z]}>
      <InteriorCameraFit lookAt={lookAt} />
    </OrthographicCamera>
  );
}

function InteriorCameraFit({ lookAt }: { lookAt: THREE.Vector3 }) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    fitOrthoToScene(camera, size.width, size.height);
    camera.lookAt(lookAt);
  }, [camera, lookAt, size.width, size.height]);

  return null;
}
