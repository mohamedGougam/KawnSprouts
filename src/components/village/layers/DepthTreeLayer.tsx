import { motion } from 'framer-motion';
import { DEPTH_TREES } from '../../../config/worldPropsConfig';
import { depthZIndex } from '../../../services/worldNavService';

interface DepthTreeLayerProps {
  playerY: number;
}

export function DepthTreeLayer({ playerY }: DepthTreeLayerProps) {
  return (
    <>
      {DEPTH_TREES.map((tree) => {
        const z = depthZIndex(tree.position.y, 'fg');
        const playerBehind = playerY < tree.position.y - 20;
        return (
          <motion.div
            key={tree.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{
              left: tree.position.x,
              top: tree.position.y,
              zIndex: playerBehind ? z : z - 100,
              scale: tree.scale ?? 1,
            }}
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 5 + (tree.id.charCodeAt(3) % 3), repeat: Infinity }}
            aria-hidden="true"
          >
            <div className="flex flex-col items-center">
              <div className="h-0 w-0 border-x-[28px] border-b-[36px] border-x-transparent border-b-green-600/85" />
              <div className="h-16 w-4 rounded-sm bg-amber-800/70" />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
