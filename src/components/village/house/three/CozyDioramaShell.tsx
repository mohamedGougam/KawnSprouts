import { useMemo } from 'react';
import * as THREE from 'three';
import type { InteriorTheme } from '../../../../config/interiorSceneConfig';
import { DIORAMA_DOME_R, DIORAMA_FLOOR_D, DIORAMA_FLOOR_W, DIORAMA_WALL_H } from './roomConstants';

interface CozyDioramaShellProps {
  theme: InteriorTheme;
  themeTime: 'day' | 'evening' | 'night';
  lampOn: boolean;
}

function WoodFloor({ color }: { color: string }) {
  const map = useMemo(() => {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d')!;
    const base = color;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    const planks = 16;
    for (let i = 0; i < planks; i++) {
      const shade = 0.88 + (i % 3) * 0.06;
      const r = parseInt(base.slice(1, 3), 16);
      const g = parseInt(base.slice(3, 5), 16);
      const b = parseInt(base.slice(5, 7), 16);
      ctx.fillStyle = `rgb(${r * shade},${g * shade},${b * shade})`;
      ctx.fillRect((i * s) / planks + 1, 0, s / planks - 3, s);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.moveTo((i * s) / planks, 0);
      ctx.lineTo((i * s) / planks, s);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 2);
    return tex;
  }, [color]);

  return <meshStandardMaterial map={map} roughness={0.88} metalness={0.02} />;
}

export function CozyDioramaShell({ theme, themeTime }: CozyDioramaShellProps) {
  const sunIntensity = themeTime === 'night' ? 0.15 : themeTime === 'evening' ? 0.35 : 0.55;
  const wallMat = <meshStandardMaterial color={theme.wallColor} roughness={0.92} />;
  const trimMat = <meshStandardMaterial color={theme.trimColor} roughness={0.78} />;

  return (
    <group>
      {/* Rounded floor platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[DIORAMA_FLOOR_W / 2.1, 32]} />
        <WoodFloor color={theme.floorColor} />
      </mesh>

      {/* Floor edge trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[DIORAMA_FLOOR_W / 2.1 - 0.05, DIORAMA_FLOOR_W / 2.1 + 0.08, 32]} />
        <meshStandardMaterial color={theme.trimColor} roughness={0.75} />
      </mesh>

      {/* Back wall — curved top */}
      <mesh position={[0, DIORAMA_WALL_H / 2, -DIORAMA_FLOOR_D / 2 + 0.1]}>
        <boxGeometry args={[DIORAMA_FLOOR_W, DIORAMA_WALL_H, 0.14]} />
        {wallMat}
      </mesh>
      <mesh position={[0, DIORAMA_WALL_H + 0.35, -DIORAMA_FLOOR_D / 2 + 0.15]}>
        <sphereGeometry args={[DIORAMA_FLOOR_W / 2.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={theme.wallColor} roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-DIORAMA_FLOOR_W / 2 + 0.08, DIORAMA_WALL_H / 2, -0.2]}>
        <boxGeometry args={[0.14, DIORAMA_WALL_H, DIORAMA_FLOOR_D]} />
        {wallMat}
      </mesh>

      {/* Right wall — shorter front for cutaway */}
      <mesh position={[DIORAMA_FLOOR_W / 2 - 0.08, DIORAMA_WALL_H / 2, -0.6]}>
        <boxGeometry args={[0.14, DIORAMA_WALL_H, DIORAMA_FLOOR_D - 1.2]} />
        {wallMat}
      </mesh>

      {/* Front corner lips */}
      <mesh position={[-DIORAMA_FLOOR_W / 2 + 0.35, DIORAMA_WALL_H / 2, DIORAMA_FLOOR_D / 2 - 0.35]}>
        <boxGeometry args={[0.45, DIORAMA_WALL_H, 0.35]} />
        {trimMat}
      </mesh>
      <mesh position={[DIORAMA_FLOOR_W / 2 - 0.35, DIORAMA_WALL_H / 2, DIORAMA_FLOOR_D / 2 - 0.35]}>
        <boxGeometry args={[0.45, DIORAMA_WALL_H, 0.35]} />
        {trimMat}
      </mesh>

      {/* Soft domed roof shell — kept smaller so the room fills the viewport */}
      <mesh position={[0, DIORAMA_WALL_H + 0.42, -0.35]}>
        <sphereGeometry args={[DIORAMA_DOME_R, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.35]} />
        <meshStandardMaterial color={theme.roofColor} roughness={0.82} side={THREE.BackSide} />
      </mesh>
      {/* Window on left wall — built in */}
      <group position={[-DIORAMA_FLOOR_W / 2 + 0.1, 1.35, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.42, 16]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#fde68a"
            emissiveIntensity={sunIntensity}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[0.44, 0.04, 6, 16]} />
          <meshStandardMaterial color={theme.trimColor} />
        </mesh>
        {/* Cross panes */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.06, 0.75, 0.02]} />
          <meshStandardMaterial color={theme.trimColor} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.75, 0.06, 0.02]} />
          <meshStandardMaterial color={theme.trimColor} />
        </mesh>
        {/* Curtains */}
        <mesh position={[-0.48, 0, 0.04]}>
          <boxGeometry args={[0.12, 0.9, 0.03]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.95} />
        </mesh>
        <mesh position={[0.48, 0, 0.04]}>
          <boxGeometry args={[0.12, 0.9, 0.03]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.95} />
        </mesh>
      </group>

      {/* Sunlight beam through window */}
      {themeTime !== 'night' && (
        <mesh position={[-1.2, 0.5, 0.2]} rotation={[0, 0.4, -0.35]}>
          <planeGeometry args={[1.8, 2.2]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      )}

    </group>
  );
}
