import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { InteriorProp, InteriorPropType, InteriorTheme } from '../../../../config/interiorSceneConfig';
import { hasHouseOwnedItem } from '../../../../services/houseDecorService';
import { playHouseSound, type HouseSoundType } from '../../../../services/houseAudioService';

const SOUND_COOLDOWN_MS = 420;
let lastSoundAt = 0;

function playPropSound(sound: HouseSoundType) {
  const now = Date.now();
  if (now - lastSoundAt < SOUND_COOLDOWN_MS) return;
  lastSoundAt = now;
  playHouseSound(sound);
}

function propHitSize(type: InteriorPropType): [number, number, number] {
  switch (type) {
    case 'bed':
      return [2.05, 0.72, 1.18];
    case 'table':
      return [1.05, 0.72, 1.05];
    case 'chair':
      return [0.72, 0.82, 0.72];
    case 'shelf':
      return [1.55, 0.62, 0.52];
    case 'rug':
      return [1.92, 0.18, 1.92];
    case 'door':
      return [0.82, 1.2, 0.55];
    case 'nightstand':
      return [0.58, 0.62, 0.52];
    case 'plant-floor':
    case 'plant':
      return [0.62, 0.72, 0.62];
    case 'chest':
      return [0.68, 0.58, 0.58];
    case 'painting':
      return [0.58, 0.48, 0.28];
    case 'clock':
      return [0.42, 0.42, 0.28];
    case 'teddy':
      return [0.5, 0.5, 0.5];
    case 'curtain':
      return [0.22, 0.62, 0.16];
    case 'heart-note':
      return [0.38, 0.38, 0.22];
    default:
      return [0.62, 0.58, 0.62];
  }
}

function propHitCenterY(type: InteriorPropType): number {
  if (type === 'rug') return 0.08;
  if (type === 'painting' || type === 'clock' || type === 'shelf') return 0.45;
  if (type === 'door') return 0.55;
  if (type === 'curtain') return 0.24;
  return 0.28;
}

function defaultPropClick(
  prop: InteriorProp,
  onClick: (e: ThreeEvent<MouseEvent>, sound?: HouseSoundType, fn?: () => void) => void,
  onDoorExit?: () => void,
) {
  switch (prop.type) {
    case 'door':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'door-creak', onDoorExit);
    case 'bed':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'cushion');
    case 'table':
    case 'nightstand':
    case 'chest':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'wood-knock');
    case 'chair':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'wood-bounce');
    case 'shelf':
    case 'book':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'page-turn');
    case 'rug':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'cushion');
    case 'teacup':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'steam');
    case 'vase':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'wood-knock');
    case 'plant-floor':
    case 'plant':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'leaf-rustle');
    case 'clock':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'clock-tick');
    case 'painting':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'wood-knock');
    case 'teddy':
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'cushion');
    case 'heart-note':
      return (e: ThreeEvent<MouseEvent>) =>
        onClick(e, prop.id.includes('wind-chime') ? 'chime-soft' : 'chime-soft');
    default:
      return (e: ThreeEvent<MouseEvent>) => onClick(e, 'wood-knock');
  }
}

interface CozyPropMeshProps {
  prop: InteriorProp;
  theme: InteriorTheme;
  onDoorExit?: () => void;
  lampOn: boolean;
  onLampToggle: () => void;
  ownedItemIds?: string[];
}

export function CozyPropMesh({ prop, theme, onDoorExit, lampOn, onLampToggle, ownedItemIds = [] }: CozyPropMeshProps) {
  const animRef = useRef(0);
  const ref = useRef<THREE.Group>(null);
  const s = prop.scale ?? 1;

  useFrame((_, delta) => {
    if (!ref.current || animRef.current <= 0) return;
    animRef.current = Math.max(0, animRef.current - delta * 3.5);
    if (prop.type === 'door') {
      ref.current.rotation.y = (prop.rotation ?? 0) + animRef.current * 0.45;
    } else {
      const t = animRef.current;
      ref.current.scale.y = 1 + Math.sin(t * 14) * 0.04 * t;
    }
  });

  const bump = () => {
    animRef.current = 1;
  };

  const click = (e: ThreeEvent<MouseEvent>, sound?: HouseSoundType, fn?: () => void) => {
    e.stopPropagation();
    if (sound) playPropSound(sound);
    bump();
    fn?.();
  };

  if (prop.type === 'lamp') {
    const starGlow = ownedItemIds.includes('star-lantern');
    return (
      <group ref={ref} position={[prop.x, prop.y, prop.z]} scale={s}>
        <mesh visible={false} onClick={(e) => click(e, 'chime-soft', onLampToggle)}>
          <sphereGeometry args={[0.38, 10, 10]} />
        </mesh>
        <mesh
          onClick={(e) => click(e, 'chime-soft', onLampToggle)}
          castShadow
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#fbbf24"
            emissiveIntensity={lampOn ? (starGlow ? 1.2 : 0.85) : starGlow ? 0.45 : 0.25}
          />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.22, 8]} />
          <meshStandardMaterial color={theme.trimColor} />
        </mesh>
      </group>
    );
  }

  const [hitW, hitH, hitD] = propHitSize(prop.type);
  const hitY = propHitCenterY(prop.type);
  const handleHit = defaultPropClick(prop, click, onDoorExit);

  return (
    <group
      ref={ref}
      position={[prop.x, prop.y, prop.z]}
      rotation={[0, prop.rotation ?? 0, 0]}
      scale={s}
    >
      <mesh visible={false} position={[0, hitY, 0]} onClick={handleHit}>
        <boxGeometry args={[hitW, hitH, hitD]} />
      </mesh>
      <PropShape
        prop={prop}
        theme={theme}
        lampOn={lampOn}
        ownedItemIds={ownedItemIds}
        onClick={click}
        onDoorExit={onDoorExit}
      />
    </group>
  );
}

function PropShape({
  prop,
  theme,
  onClick,
  onDoorExit,
  ownedItemIds = [],
}: {
  prop: InteriorProp;
  theme: InteriorTheme;
  lampOn: boolean;
  ownedItemIds?: string[];
  onClick: (e: ThreeEvent<MouseEvent>, sound?: HouseSoundType, fn?: () => void) => void;
  onDoorExit?: () => void;
}) {
  const owned = (id: string) => hasHouseOwnedItem(ownedItemIds, id);
  const wood = <meshStandardMaterial color={theme.trimColor} roughness={0.78} />;
  const woodLight = <meshStandardMaterial color="#a67c52" roughness={0.8} />;

  switch (prop.type) {
    case 'bed': {
      const fabricColor = owned('bed-sheets') ? '#bfdbfe' : theme.fabricColor;
      return (
        <group onClick={(e) => onClick(e, 'cushion')}>
          <RoundedBox args={[1.85, 0.32, 1.05]} radius={0.1} position={[0, 0.18, 0]} castShadow>
            <meshStandardMaterial color={fabricColor} roughness={0.92} />
          </RoundedBox>
          <RoundedBox args={[0.35, 0.22, 1.0]} radius={0.06} position={[-0.72, 0.38, 0]} castShadow>
            <meshStandardMaterial color="#fef3c7" roughness={0.95} />
          </RoundedBox>
          <mesh position={[0, 0.38, 0.15]} castShadow>
            <boxGeometry args={[1.6, 0.08, 0.85]} />
            <meshStandardMaterial color={fabricColor} roughness={0.95} />
          </mesh>
        </group>
      );
    }
    case 'nightstand':
      return (
        <RoundedBox args={[0.42, 0.48, 0.38]} radius={0.05} onClick={(e) => onClick(e, 'wood-knock')} castShadow>
          {wood}
        </RoundedBox>
      );
    case 'rug':
      return (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          onClick={(e) => onClick(e, 'cushion', undefined)}
          receiveShadow
        >
          <circleGeometry args={[0.88, 40]} />
          <meshStandardMaterial color={owned('woven-rug') ? '#fb7185' : theme.rugColor} roughness={0.98} />
        </mesh>
      );
    case 'table':
      return (
        <group onClick={(e) => onClick(e, 'wood-knock')}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.44, 0.07, 24]} />
            {woodLight}
          </mesh>
          {owned('table-cloth') && (
            <mesh position={[0, 0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.38, 24]} />
              <meshStandardMaterial color="#fca5a5" transparent opacity={0.85} roughness={0.95} />
            </mesh>
          )}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.28, 12]} />
            {wood}
          </mesh>
        </group>
      );
    case 'chair': {
      const isPurchased = prop.id.startsWith('owned-');
      const fabricColor = isPurchased ? '#fbbf24' : theme.fabricColor;
      return (
        <group onClick={(e) => onClick(e, 'wood-bounce')}>
          <RoundedBox args={[0.48, 0.42, 0.44]} radius={0.08} position={[0, 0.24, 0]} castShadow>
            <meshStandardMaterial color={fabricColor} roughness={0.88} />
          </RoundedBox>
          <RoundedBox args={[0.44, 0.1, 0.4]} radius={0.04} position={[0, 0.48, -0.08]} castShadow>
            <meshStandardMaterial color={fabricColor} roughness={0.88} />
          </RoundedBox>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[(i < 2 ? -1 : 1) * 0.16, 0.1, (i % 2 === 0 ? -1 : 1) * 0.14]}
              castShadow
            >
              <cylinderGeometry args={[0.035, 0.035, 0.2, 8]} />
              {wood}
            </mesh>
          ))}
        </group>
      );
    }
    case 'teacup':
      return (
        <mesh position={[0, 0, 0]} onClick={(e) => onClick(e, 'steam')} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
      );
    case 'book':
      return (
        <mesh onClick={(e) => onClick(e, 'page-turn')} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.1]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>
      );
    case 'vase':
      return (
        <group onClick={(e) => onClick(e, 'wood-knock')}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.07, 0.12, 10]} />
            <meshStandardMaterial color="#d97706" roughness={0.65} />
          </mesh>
          {owned('flower-vase') && (
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#f472b6" roughness={0.8} />
            </mesh>
          )}
        </group>
      );
    case 'door':
      return (
        <group onClick={(e) => onClick(e, 'door-creak', onDoorExit)}>
          <RoundedBox args={[0.62, 1.05, 0.1]} radius={0.12} position={[0, 0.55, 0]} castShadow>
            {wood}
          </RoundedBox>
          <mesh position={[0.22, 0.5, 0.08]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.35]}>
            <boxGeometry args={[0.55, 0.35, 0.03]} />
            <meshStandardMaterial color={theme.rugColor} roughness={0.95} />
          </mesh>
        </group>
      );
    case 'doormat':
      return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <boxGeometry args={[0.55, 0.35, 0.02]} />
          <meshStandardMaterial color="#78716c" roughness={0.98} />
        </mesh>
      );
    case 'shelf':
      return (
        <group onClick={(e) => onClick(e, 'page-turn')}>
          <RoundedBox args={[1.35, 0.1, 0.28]} radius={0.03} position={[0, 0, 0]} castShadow>
            {wood}
          </RoundedBox>
          <mesh position={[-0.35, 0.1, 0]} castShadow>
            <boxGeometry args={[0.12, 0.16, 0.08]} />
            <meshStandardMaterial color="#fca5a5" />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.1, 0.14, 0.07]} />
            <meshStandardMaterial color="#86efac" />
          </mesh>
          <mesh position={[0.35, 0.1, 0]} castShadow>
            <boxGeometry args={[0.11, 0.15, 0.08]} />
            <meshStandardMaterial color="#93c5fd" />
          </mesh>
          <mesh position={[0.55, 0.12, 0.05]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
          {owned('wooden-toy') && (
            <mesh position={[-0.55, 0.14, 0.02]} onClick={(e) => onClick(e, 'cushion')} castShadow>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#a16207" roughness={0.9} />
            </mesh>
          )}
        </group>
      );
    case 'clock':
      return (
        <mesh onClick={(e) => onClick(e, 'clock-tick')} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 20]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
      );
    case 'painting':
      return (
        <group onClick={(e) => onClick(e, 'wood-knock')}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.32, 0.04]} />
            <meshStandardMaterial color={theme.trimColor} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.36, 0.26, 0.02]} />
            <meshStandardMaterial color={owned('sun-painting') ? '#fde047' : '#fde68a'} />
          </mesh>
        </group>
      );
    case 'plant-floor':
    case 'plant':
      return (
        <group onClick={(e) => onClick(e, 'leaf-rustle')}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.18, 10]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshStandardMaterial color="#4ade80" roughness={0.85} />
          </mesh>
        </group>
      );
    case 'chest':
      return (
        <RoundedBox args={[0.5, 0.3, 0.36]} radius={0.05} onClick={(e) => onClick(e, 'wood-knock')} castShadow>
          {wood}
        </RoundedBox>
      );
    case 'slippers':
      return (
        <group>
          <mesh position={[-0.08, 0.04, 0]}>
            <boxGeometry args={[0.12, 0.05, 0.2]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          <mesh position={[0.1, 0.04, 0.02]}>
            <boxGeometry args={[0.12, 0.05, 0.2]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        </group>
      );
    case 'heart-note':
      return (
        <mesh onClick={(e) => onClick(e, prop.id.includes('wind-chime') ? 'chime-soft' : 'chime-soft')}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshStandardMaterial color={prop.id.includes('wind-chime') ? '#bae6fd' : '#fecdd3'} />
        </mesh>
      );
    case 'curtain':
      return (
        <mesh>
          <boxGeometry args={[0.07, 0.48, 0.02]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.82} roughness={0.95} />
        </mesh>
      );
    case 'teddy': {
      const isPurchased = prop.id.startsWith('owned-');
      const radius = isPurchased ? 0.14 : 0.1;
      return (
        <group onClick={(e) => onClick(e, 'cushion')}>
          <mesh castShadow>
            <sphereGeometry args={[radius, 12, 12]} />
            <meshStandardMaterial color="#a16207" roughness={0.9} />
          </mesh>
          {isPurchased && (
            <mesh position={[0, radius * 0.55, radius * 0.35]} castShadow>
              <sphereGeometry args={[radius * 0.55, 10, 10]} />
              <meshStandardMaterial color="#a16207" roughness={0.9} />
            </mesh>
          )}
        </group>
      );
    }
    case 'window':
      return (
        <mesh onClick={(e) => onClick(e, 'wind-window')}>
          <boxGeometry args={[0.5, 0.5, 0.05]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      );
    default:
      return null;
  }
}
