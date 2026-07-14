import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../app/store/gameStore';
import {
  VILLAGE_HOUSES,
  VILLAGE_SHOP,
  WORLD_OBJECTS,
  FRIEND_WAYPOINTS,
  WILDLIFE,
  WORLD_REGIONS,
  WORLD_SIZE,
  HOME_POSITION,
  PLAYER_SPROUT_ID,
  distanceBetween,
} from '../../config/villageConfig';
import { SECRET_DISCOVERIES } from '../../config/worldPropsConfig';
import { WORLD_TREASURES } from '../../config/treasureConfig';
import { isTreasureAvailable } from '../../services/treasureService';
import { getCareNeed, getKawnDisplayAge } from '../../services/careNeedsService';
import { buildAtmosphere } from '../../services/atmosphereService';
import { getVisibleChunks, isInVisibleChunks } from '../../services/worldChunkService';
import { createWildlifeStates, tickWildlife, type WildlifeState } from '../../services/wildlifeBehaviorService';
import { depthZIndex, getTerrainGrid, worldToTile } from '../../services/worldNavService';
import { findLandPath } from '../../services/pathfindingService';
import { VillageHouse } from './VillageHouse';
import {
  HouseExperienceLayer,
  useHouseExperience,
} from './house/HouseExperienceLayer';
import { ShopExperienceLayer, useShopExperience } from './shop/ShopExperienceLayer';
import { ShopInteriorView } from './shop/ShopInteriorView';
import { VillageShopBuilding } from './shop/VillageShopBuilding';
import {
  resolveHatAttachment,
  resolveHatDisplay,
  getVehicleSpeedMultiplier,
} from '../../features/shop/services/cosmeticService';
import { playShopSound } from '../../features/shop/services/shopAudioService';
import { markHouseNearby, preloadNearbyHouses } from '../../services/housePreloadService';
import { TreasureCollectible } from './TreasureCollectible';
import { VillageSproutMarker } from './VillageSproutMarker';
import { WorldObjectPin } from './WorldObjectPin';
import { VillageSheet } from './VillageSheet';
import { LandscapeDecor } from './LandscapeDecor';
import { WildlifePin } from './WildlifePin';
import { HeadMessageBubble } from './HeadMessageBubble';
import { VillageThreadPanel } from './VillageThreadPanel';
import { WorldEntityAnchor } from './WorldEntityAnchor';
import { SecretTapZone } from './SecretTapZone';
import { BoatEntity } from './BoatEntity';
import { WorldSkyLayer } from './layers/WorldSkyLayer';
import { WorldTerrainLayer } from './layers/WorldTerrainLayer';
import { WaterLayer } from './layers/WaterLayer';
import { ScatterPropsLayer } from './layers/ScatterPropsLayer';
import { DepthTreeLayer } from './layers/DepthTreeLayer';
import { AmbientLifeLayer } from './layers/AmbientLifeLayer';
import type { Friend, VillageHouse as VillageHouseModel, VillageMessage, WildlifeAnimal, WorldObject, WorldPosition } from '../../models';
import { getHeadBubble, getPublicShout, findDirectThreadId, getThreadMessages, getThreadPartnerName } from '../../services/villageChatService';
import { PLAYER_MOTION_SCALE, WALK_SPEED_PX } from '../../config/worldConstants';
import { useCozyCamera } from '../../hooks/useCozyCamera';
import { usePlayerWalk } from '../../hooks/usePlayerWalk';
import { useVillageAudio } from '../../hooks/useVillageAudio';
import {
  unlockAudio,
  playWorldSound,
  playObjectSound,
} from '../../services/audioService';
import {
  TERMINOLOGY,
  namedYourKawniee,
} from '../../config/terminology';
import { Bike, Droplets, Heart, Home, MapPin, ShoppingBag, Users } from 'lucide-react';

type SheetType = 'own' | 'other' | 'object' | 'wildlife' | null;

interface NpcState {
  id: string;
  position: WorldPosition;
  waypointIndex: number;
  path: WorldPosition[];
  pathIndex: number;
}

export function VillageWorldView() {
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);

  const player = useGameStore((s) => s.player);
  const sprout = useGameStore((s) => s.sprout);
  const friends = useGameStore((s) => s.friends);
  const storedPosition = useGameStore((s) => s.villagePosition);
  const lastWateredAt = useGameStore((s) => s.lastWateredAt);
  const discoveredWorldObjects = useGameStore((s) => s.discoveredWorldObjects);
  const discoveredSecrets = useGameStore((s) => s.discoveredSecrets);
  const villageMessages = useGameStore((s) => s.villageMessages);
  const moveVillageSprout = useGameStore((s) => s.moveVillageSprout);
  const discoverWorldObject = useGameStore((s) => s.discoverWorldObject);
  const discoverSecret = useGameStore((s) => s.discoverSecret);
  const sendHeart = useGameStore((s) => s.sendHeart);
  const postVillageShout = useGameStore((s) => s.postVillageShout);
  const replyToVillageMessage = useGameStore((s) => s.replyToVillageMessage);
  const startDirectVillageChat = useGameStore((s) => s.startDirectVillageChat);
  const getEffectiveTheme = useGameStore((s) => s.getEffectiveTheme);
  const settings = useGameStore((s) => s.settings);
  const currency = useGameStore((s) => s.currency);
  const houseProgress = useGameStore((s) => s.houseProgress);
  const treasureCollection = useGameStore((s) => s.treasureCollection);
  const collectTreasure = useGameStore((s) => s.collectTreasure);
  const buyHouseItem = useGameStore((s) => s.buyHouseItem);
  const isShopUnlocked = useGameStore((s) => s.isShopUnlocked);
  const equippedCosmetics = useGameStore((s) => s.equippedCosmetics);
  const equippedVehicle = useGameStore((s) => s.equippedVehicle);
  const furniturePlacements = useGameStore((s) => s.furniturePlacements);
  const mountShopVehicle = useGameStore((s) => s.mountShopVehicle);
  const dismountShopVehicle = useGameStore((s) => s.dismountShopVehicle);

  const houseExperience = useHouseExperience();
  const shopExperience = useShopExperience();
  const insideHouse = houseExperience.isInside;
  const insideShop = shopExperience.isInside;
  const outdoorsSuspended = insideHouse || insideShop;

  const [displayPos, setDisplayPos] = useState<WorldPosition>(storedPosition);
  const [viewportSize, setViewportSize] = useState({ w: 390, h: 700 });
  const [secretMsg, setSecretMsg] = useState('');

  const hatDisplay = resolveHatDisplay(equippedCosmetics);
  const hatAttach = resolveHatAttachment(equippedCosmetics);
  const bikeSpeedPx = useMemo(() => {
    if (!equippedVehicle.mounted || !equippedVehicle.vehicleId) return WALK_SPEED_PX;
    return WALK_SPEED_PX * getVehicleSpeedMultiplier(equippedVehicle.vehicleId);
  }, [equippedVehicle.mounted, equippedVehicle.vehicleId]);

  const { walkTo, isMoving, transportMode } = usePlayerWalk({
    position: displayPos,
    onPositionChange: setDisplayPos,
    onArrive: (final) => moveVillageSprout(final),
    onTransportChange: (mode) => {
      if (mode === 'boat' && (settings.soundEffectsEnabled || settings.characterSoundsEnabled)) {
        playWorldSound('paddle', displayPos, displayPos);
      }
      if (mode === 'bicycle' && (settings.soundEffectsEnabled || settings.characterSoundsEnabled)) {
        playShopSound('bike-bell', true);
      }
    },
    bikeMounted: equippedVehicle.mounted,
    bikeSpeedPx,
  });

  const theme = getEffectiveTheme();
  const atmosphere = useMemo(() => buildAtmosphere(theme), [theme]);
  const careNeed = getCareNeed(lastWateredAt, sprout.name);

  const [sheet, setSheet] = useState<SheetType>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedObject, setSelectedObject] = useState<WorldObject | null>(null);
  const [selectedWildlife, setSelectedWildlife] = useState<WildlifeAnimal | null>(null);
  const [collectMsg, setCollectMsg] = useState('');
  const [shoutInput, setShoutInput] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadInput, setThreadInput] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [pendingChatFriendId, setPendingChatFriendId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const [wildlife, setWildlife] = useState<WildlifeState[]>(() =>
    createWildlifeStates(theme === 'night'),
  );

  const { camera, screenToWorld, zoom, resetPan, consumeTapBlock, labelScale } = useCozyCamera(
    displayPos,
    isMoving,
    viewportRef,
  );

  const { sfxEnabled: soundEnabled } = useVillageAudio({
    musicEnabled: settings.musicEnabled,
    soundEffectsEnabled: settings.soundEffectsEnabled,
    characterSoundsEnabled: settings.characterSoundsEnabled,
    displayPos,
    atmosphere,
    getAnimals: () => wildlife.filter((w) => w.visible).map((w) => ({ activity: w.behavior, position: w.position })),
    suspendOutdoor: outdoorsSuspended,
  });

  const [npcs, setNpcs] = useState<NpcState[]>(() =>
    friends.map((f) => {
      const start = FRIEND_WAYPOINTS[f.id]?.[0] ?? { x: 1800, y: 2400 };
      return { id: f.id, position: start, waypointIndex: 0, path: [start], pathIndex: 0 };
    }),
  );

  const friendById = useMemo(() => Object.fromEntries(friends.map((f) => [f.id, f])), [friends]);

  const nearestFriendNpc = useMemo(() => {
    if (!npcs.length) return null;
    let best: { position: WorldPosition; sproutName: string; dist: number } | null = null;
    for (const npc of npcs) {
      const friend = friendById[npc.id];
      if (!friend) continue;
      const dist = distanceBetween(displayPos, npc.position);
      if (!best || dist < best.dist) {
        best = { position: npc.position, sproutName: friend.sproutName, dist };
      }
    }
    return best;
  }, [npcs, displayPos, friendById]);

  const threadMessages = useMemo(
    () => (activeThreadId ? getThreadMessages(villageMessages, activeThreadId) : []),
    [villageMessages, activeThreadId],
  );

  const threadTitle = useMemo(
    () => {
      if (pendingChatFriendId) {
        const friend = friends.find((f) => f.id === pendingChatFriendId);
        return friend ? `${friend.name} (${friend.sproutName})` : 'Chat';
      }
      return activeThreadId
        ? getThreadPartnerName(villageMessages, activeThreadId, player.id, friends, player.name)
        : '';
    },
    [pendingChatFriendId, activeThreadId, villageMessages, player.id, player.name, friends],
  );

  const bubbleFor = useCallback(
    (residentId: string) => getHeadBubble(villageMessages, residentId, player.id, activeThreadId),
    [villageMessages, player.id, activeThreadId],
  );

  const handleMessageTap = useCallback(
    (message: VillageMessage) => {
      if (message.senderId === player.id && message.kind === 'shout') return;
      if (message.threadId && message.participantIds.includes(player.id)) {
        setActiveThreadId(message.threadId);
        setReplyToMessageId(message.id);
        return;
      }
      if (message.kind === 'shout' || message.kind === 'thread') {
        setReplyToMessageId(message.id);
        const threadId = message.threadId ?? `thread-${message.id}`;
        setActiveThreadId(threadId);
      }
    },
    [player.id],
  );

  const sendThreadReply = useCallback(() => {
    if (pendingChatFriendId && !threadInput.trim()) return;

    if (pendingChatFriendId && !replyToMessageId && threadMessages.length === 0) {
      const result = startDirectVillageChat(pendingChatFriendId, threadInput);
      if (result.success) {
        setThreadInput('');
        setPendingChatFriendId(null);
        if (result.threadId) setActiveThreadId(result.threadId);
      }
      return;
    }

    const targetId = replyToMessageId ?? threadMessages[threadMessages.length - 1]?.id;
    if (!targetId || !threadInput.trim()) return;
    const result = replyToVillageMessage(targetId, threadInput);
    if (result.success) {
      setThreadInput('');
      setPendingChatFriendId(null);
      if (result.threadId) setActiveThreadId(result.threadId);
    }
  }, [pendingChatFriendId, replyToMessageId, threadMessages, threadInput, replyToVillageMessage, startDirectVillageChat]);

  const visibleChunks = useMemo(
    () => getVisibleChunks(camera.x, camera.y, viewportSize.w, viewportSize.h, zoom),
    [camera.x, camera.y, viewportSize.w, viewportSize.h, zoom],
  );

  const inView = useCallback(
    (pos: WorldPosition) => isInVisibleChunks(pos, visibleChunks),
    [visibleChunks],
  );

  useEffect(() => {
    const nearbyIds = VILLAGE_HOUSES.filter((h) => inView(h.position)).map((h) => h.id);
    preloadNearbyHouses(nearbyIds);
  });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setDisplayPos(storedPosition);
  }, [storedPosition.x, storedPosition.y]);

  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      setWildlife((prev) => tickWildlife(prev, now - last, theme === 'night'));
      last = now;
    }, 800);
    return () => clearInterval(id);
  }, [theme]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNpcs((prev) =>
        prev.map((npc) => {
          const waypoints = FRIEND_WAYPOINTS[npc.id];
          if (!waypoints?.length) return npc;
          const nextIndex = (npc.waypointIndex + 1) % waypoints.length;
          const target = waypoints[nextIndex];
          const path = findLandPath(npc.position, target) ?? [target];
          return {
            ...npc,
            waypointIndex: nextIndex,
            position: path[path.length - 1],
            path,
            pathIndex: 0,
          };
        }),
      );
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleMapPointer = useCallback(
    (clientX: number, clientY: number, target: EventTarget | null) => {
      if (outdoorsSuspended || consumeTapBlock()) return;
      unlockAudio();
      if ((target as HTMLElement)?.closest('[data-world-entity]')) return;
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      resetPan();
      const world = screenToWorld(clientX, clientY, rect);
      const snapped = {
        x: Math.round(Math.max(80, Math.min(WORLD_SIZE - 80, world.x))),
        y: Math.round(Math.max(80, Math.min(WORLD_SIZE - 80, world.y))),
      };
      if (equippedVehicle.mounted) {
        const tile = getTerrainGrid()[worldToTile(snapped).row]?.[worldToTile(snapped).col];
        if (tile === 'water') {
          setActionMsg('Bicycles prefer dry paths.');
          window.setTimeout(() => setActionMsg(''), 2800);
          return;
        }
      }
      walkTo(snapped);
    },
    [screenToWorld, walkTo, outdoorsSuspended, equippedVehicle.mounted, consumeTapBlock, resetPan],
  );

  const handleHouseTap = useCallback(
    (house: VillageHouseModel) => {
      if (outdoorsSuspended) return;
      unlockAudio();
      if (equippedVehicle.mounted) dismountShopVehicle();
      if (soundEnabled) playWorldSound('chime', house.position, displayPos);
      markHouseNearby(house.id);
      houseExperience.enterHouse(house, displayPos);
    },
    [outdoorsSuspended, soundEnabled, displayPos, houseExperience, equippedVehicle.mounted, dismountShopVehicle],
  );

  const openShop = useCallback(() => {
    if (outdoorsSuspended) return;
    unlockAudio();
    if (equippedVehicle.mounted) dismountShopVehicle();
    if (soundEnabled) {
      playShopSound('bell', true);
      playShopSound('door', true);
    }
    const entryPos = useGameStore.getState().villagePosition;
    shopExperience.enterShop(entryPos);
  }, [outdoorsSuspended, soundEnabled, shopExperience, equippedVehicle.mounted, dismountShopVehicle]);

  const handleShopTap = useCallback(() => {
    openShop();
  }, [openShop]);

  const goToMarket = useCallback(() => {
    if (outdoorsSuspended) return;
    unlockAudio();
    const started = walkTo(VILLAGE_SHOP.doorPosition, { onArrive: openShop });
    if (!started) openShop();
  }, [outdoorsSuspended, walkTo, openShop]);

  const handleShopExit = useCallback(() => {
    shopExperience.exitShop((savedPos) => {
      if (savedPos) {
        setDisplayPos(savedPos);
        moveVillageSprout(savedPos);
      }
    });
  }, [shopExperience, moveVillageSprout]);

  const handleHouseExit = useCallback(() => {
    houseExperience.exitHouse((savedPos) => {
      if (savedPos) {
        setDisplayPos(savedPos);
        moveVillageSprout(savedPos);
      }
    });
  }, [houseExperience, moveVillageSprout]);

  const handleSecret = (secret: (typeof SECRET_DISCOVERIES)[0]) => {
    discoverSecret(secret.id);
    setSecretMsg(secret.reveal);
    if (soundEnabled) playWorldSound(secret.sound as Parameters<typeof playWorldSound>[0], secret.position, displayPos);
    setTimeout(() => setSecretMsg(''), 3500);
  };

  const worldTransform = `translate(${-camera.x * zoom}px, ${-camera.y * zoom}px) scale(${zoom})`;

  const wildlifeById = useMemo(() => Object.fromEntries(WILDLIFE.map((a) => [a.id, a])), []);

  const navBtnClass =
    'focus-ring pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white shadow-sm backdrop-blur-md transition-colors';

  return (
    <div className="relative flex h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-sky-100">
      <div className="relative z-10 shrink-0 overflow-hidden">
        <motion.div
          animate={{ y: isMoving ? '-100%' : 0, opacity: isMoving ? 0 : 1 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-center bg-black/10 px-4 pb-2 pt-3 backdrop-blur-sm"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm">
            <span>💎 {currency.diamonds}</span>
            <span className="text-gray-300">|</span>
            <span>🪙 {currency.gold}</span>
          </div>
        </motion.div>
      </div>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 touch-manipulation overflow-hidden"
        style={{
          opacity: outdoorsSuspended ? 0 : 1,
          pointerEvents: outdoorsSuspended ? 'none' : 'auto',
          transition: 'opacity 0.25s ease',
        }}
        onClick={(e) => {
          if (consumeTapBlock()) return;
          handleMapPointer(e.clientX, e.clientY, e.target);
        }}
        onTouchEnd={(e) => {
          if (consumeTapBlock()) return;
          const t = e.changedTouches[0];
          if (t) handleMapPointer(t.clientX, t.clientY, e.target);
        }}
        role="application"
        aria-label="Cozy explorable village world"
      >
        <WorldSkyLayer
          atmosphere={atmosphere}
          camera={camera}
          viewportW={viewportSize.w}
          viewportH={viewportSize.h}
        />

        <AmbientLifeLayer
          atmosphere={atmosphere}
          camera={camera}
          viewportW={viewportSize.w}
          viewportH={viewportSize.h}
        />

        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ width: WORLD_SIZE, height: WORLD_SIZE, transform: worldTransform }}
        >
          <WorldTerrainLayer regions={WORLD_REGIONS} atmosphere={atmosphere} camera={camera} />
          <LandscapeDecor />
          <WaterLayer camera={camera} />
          <ScatterPropsLayer layer="midground" camera={camera} />

          {VILLAGE_HOUSES.filter((h) => inView(h.position)).map((house) => (
            <div
              key={house.id}
              className="absolute"
              style={{ left: house.position.x, top: house.position.y, zIndex: depthZIndex(house.position.y) }}
            >
              <button
                type="button"
                data-world-entity="true"
                className="focus-ring"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHouseTap(house);
                }}
                aria-label={`Enter ${house.label}`}
              >
                <VillageHouse house={house} isPlayer={house.ownerId === player.id} lanternsLit={atmosphere.lanternsLit} />
              </button>
            </div>
          ))}

          {inView(VILLAGE_SHOP.position) && (
            <div
              className="absolute"
              style={{
                left: VILLAGE_SHOP.position.x,
                top: VILLAGE_SHOP.position.y,
                zIndex: depthZIndex(VILLAGE_SHOP.position.y) + 5,
              }}
            >
              <button
                type="button"
                data-world-entity="true"
                data-shop-building="true"
                className="focus-ring rounded-2xl p-3 transition hover:scale-105 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShopTap();
                }}
                aria-label={`Enter ${VILLAGE_SHOP.label} shop`}
              >
                <VillageShopBuilding lanternsLit={atmosphere.lanternsLit} />
              </button>
            </div>
          )}

          {WORLD_TREASURES.filter((t) => inView(t.position) && isTreasureAvailable(t.id, treasureCollection)).map(
            (treasure) => (
              <div
                key={treasure.id}
                className="absolute"
                style={{ left: treasure.position.x, top: treasure.position.y, zIndex: depthZIndex(treasure.position.y) }}
              >
                <TreasureCollectible
                  treasure={treasure}
                  available
                  onCollect={() => {
                    const result = collectTreasure(treasure.id);
                    if (result.success) {
                      if (soundEnabled) playWorldSound('chime', treasure.position, displayPos);
                      setCollectMsg(`+${treasure.amount} ${treasure.type === 'diamond' ? '💎' : '🪙'}`);
                      setTimeout(() => setCollectMsg(''), 2000);
                    }
                  }}
                />
              </div>
            ),
          )}

          {WORLD_OBJECTS.filter((o) => inView(o.position)).map((obj) => (
            <div key={obj.id} style={{ zIndex: depthZIndex(obj.position.y) }}>
              <WorldObjectPin
                object={obj}
                discovered={discoveredWorldObjects.includes(obj.id)}
                onTap={() => {
                  if (soundEnabled) playObjectSound(obj.type, obj.position, displayPos);
                  setSelectedObject(obj);
                  setSheet('object');
                  discoverWorldObject(obj.id);
                }}
              />
            </div>
          ))}

          {wildlife
            .filter((w) => w.visible && inView(w.position))
            .map((w) => {
              const animal = wildlifeById[w.id];
              if (!animal) return null;
              return (
                <div key={w.id} style={{ zIndex: depthZIndex(w.position.y) }}>
                  <WildlifePin
                    animal={{ ...animal, position: w.position, activity: w.behavior }}
                    headMessage={bubbleFor(animal.id)}
                    onMessageTap={handleMessageTap}
                    labelScale={labelScale}
                    soundEnabled={soundEnabled}
                    listenerPos={displayPos}
                    viewerId={player.id}
                    onTap={() => {
                      setSelectedWildlife(animal);
                      setSheet('wildlife');
                    }}
                  />
                </div>
              );
            })}

          {npcs
            .filter((npc) => inView(npc.position))
            .map((npc) => {
              const friend = friendById[npc.id];
              if (!friend) return null;
              const headMsg = bubbleFor(friend.id);
              return (
                <motion.div
                  key={npc.id}
                  className="absolute"
                  style={{ zIndex: depthZIndex(npc.position.y) }}
                  animate={{ left: npc.position.x, top: npc.position.y }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  data-world-entity="true"
                >
                  <WorldEntityAnchor>
                    <HeadMessageBubble
                      message={headMsg}
                      labelScale={labelScale}
                      tappable={!!headMsg && headMsg.senderId !== player.id}
                      hintReply={!!headMsg && headMsg.kind === 'shout'}
                      onTap={handleMessageTap}
                    />
                    <VillageSproutMarker
                      color={friend.sproutColor}
                      name={friend.sproutName}
                      position={{ x: 0, y: 0 }}
                      embedded
                      labelScale={labelScale}
                      onTapSound={() => soundEnabled && playWorldSound('blob', npc.position, displayPos)}
                      onTap={() => {
                        setSelectedFriend(friend);
                        setSheet('other');
                      }}
                    />
                  </WorldEntityAnchor>
                </motion.div>
              );
            })}

          {SECRET_DISCOVERIES.filter((s) => inView(s.position)).map((secret) => (
            <SecretTapZone
              key={secret.id}
              secret={secret}
              discovered={discoveredSecrets.includes(secret.id)}
              onDiscover={handleSecret}
            />
          ))}

          <DepthTreeLayer playerY={displayPos.y} />

          {transportMode === 'boat' && <BoatEntity position={displayPos} />}

          {transportMode !== 'boat' && (
            <div
              className="absolute"
              style={{ left: displayPos.x, top: displayPos.y, zIndex: depthZIndex(displayPos.y) + 10 }}
              data-world-entity="true"
            >
              <WorldEntityAnchor>
                <HeadMessageBubble
                  message={bubbleFor(PLAYER_SPROUT_ID)}
                  labelScale={labelScale}
                  tappable={false}
                />
                <VillageSproutMarker
                  color={sprout.color}
                  emotion={careNeed.emotion}
                  name={sprout.name}
                  isPlayer
                  position={{ x: 0, y: 0 }}
                  embedded
                  labelScale={labelScale}
                  hatOverlay={hatDisplay}
                  hatOffset={
                    hatAttach
                      ? { offsetX: hatAttach.offsetX, offsetY: hatAttach.offsetY, scale: hatAttach.scale }
                      : null
                  }
                  showBicycle={equippedVehicle.mounted}
                  bicycleVariant={equippedVehicle.vehicleId}
                  animate={!isMoving}
                  motionScale={isMoving ? PLAYER_MOTION_SCALE : 1}
                  onTapSound={() => soundEnabled && playWorldSound('blob', displayPos, displayPos)}
                  onTap={() => setSheet('own')}
                />
              </WorldEntityAnchor>
            </div>
          )}

          <ScatterPropsLayer layer="foreground" camera={camera} />
        </div>

        {secretMsg && (
          <div className="pointer-events-none absolute bottom-28 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-xl">
            ✨ {secretMsg}
          </div>
        )}

        <VillageThreadPanel
          open={!!activeThreadId}
          title={threadTitle}
          messages={threadMessages}
          viewerId={player.id}
          input={threadInput}
          onInputChange={setThreadInput}
          onSend={sendThreadReply}
          inputPlaceholder={pendingChatFriendId ? 'Say hi…' : 'Reply…'}
          onClose={() => {
            setActiveThreadId(null);
            setReplyToMessageId(null);
            setPendingChatFriendId(null);
            setThreadInput('');
          }}
        />
      </div>

      {!outdoorsSuspended && (
        <div className="pointer-events-none absolute bottom-24 left-3 z-40 flex flex-col gap-2">
          <button
            type="button"
            onClick={goToMarket}
            className={`${navBtnClass} bg-amber-400/55 hover:bg-amber-400/75`}
            aria-label="Take me to the market"
          >
            <ShoppingBag size={18} strokeWidth={2.25} />
          </button>
          {nearestFriendNpc && (
            <button
              type="button"
              onClick={() => walkTo(nearestFriendNpc.position)}
              className={`${navBtnClass} bg-violet-400/55 hover:bg-violet-400/75`}
              aria-label={`Visit nearby ${TERMINOLOGY.species.singular}`}
            >
              <Users size={18} strokeWidth={2.25} />
            </button>
          )}
          <button
            type="button"
            onClick={() => walkTo(HOME_POSITION)}
            className={`${navBtnClass} bg-orange-400/55 hover:bg-orange-400/75`}
            aria-label="Take me home"
          >
            <Home size={18} strokeWidth={2.25} />
          </button>
          {equippedVehicle.vehicleId && (
            <button
              type="button"
              onClick={() => {
                if (equippedVehicle.mounted) {
                  dismountShopVehicle();
                } else {
                  mountShopVehicle();
                }
                if (soundEnabled) playShopSound('bike-bell', true);
              }}
              className={`${navBtnClass} bg-sky-400/55 hover:bg-sky-400/75`}
              aria-label={equippedVehicle.mounted ? 'Hop off bicycle' : 'Ride bicycle'}
            >
              <Bike size={18} strokeWidth={2.25} />
            </button>
          )}
        </div>
      )}

      {actionMsg && (
        <div className="pointer-events-none absolute bottom-44 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-xl">
          {actionMsg}
        </div>
      )}

      {/* Sheets — unchanged structure */}
      <VillageSheet open={sheet === 'own'} onClose={() => setSheet(null)} title={namedYourKawniee(sprout.name)}>
        <p className={`mb-4 text-sm ${careNeed.level === 'urgent' ? 'text-orange-700' : 'text-gray-700'}`}>
          {careNeed.message}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { setSheet(null); navigate('/home'); }}
            className="focus-ring flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-mint-400 py-3 font-semibold text-white"
          >
            <Droplets size={18} />
            Care for {sprout.name}
          </button>
          <p className="text-xs font-medium text-gray-600">Say something everyone nearby can hear:</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (postVillageShout(shoutInput).success) setShoutInput('');
            }}
          >
            <input
              value={shoutInput}
              onChange={(e) => setShoutInput(e.target.value)}
              placeholder="Hi everyone!"
              maxLength={120}
              className="focus-ring min-h-[44px] flex-1 rounded-xl border border-gray-200 px-3 text-sm"
            />
            <button type="submit" className="focus-ring rounded-xl bg-sky-400 px-4 font-semibold text-white">
              Say
            </button>
          </form>
          <p className="text-center text-xs text-gray-500">
            <MapPin size={12} className="mr-1 inline" />
            Tap someone&apos;s bubble to start a private reply
          </p>
        </div>
      </VillageSheet>

      <VillageSheet open={sheet === 'other' && !!selectedFriend} onClose={() => { setSheet(null); setSelectedFriend(null); }} title={selectedFriend?.sproutName ?? ''}>
        {selectedFriend && (
          <>
            <p className="text-sm text-gray-600">Cared for by {selectedFriend.name}</p>
            {(() => {
              const displayAge = getKawnDisplayAge(selectedFriend.kawnAge ?? selectedFriend.age, selectedFriend.privacy.showAgeToFriends, true);
              return displayAge !== null ? (
                <p className="mt-1 text-sm font-medium text-gray-800">Age {displayAge}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Age hidden for privacy</p>
              );
            })()}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="focus-ring flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl bg-pink-100 py-2 text-sm font-medium text-pink-600" onClick={() => setActionMsg(sendHeart(selectedFriend.id).message ?? 'Heart sent!')}>
                <Heart size={16} /> Heart
              </button>
              <button type="button" className="focus-ring flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl bg-mint-100 py-2 text-sm font-medium text-mint-700" onClick={() => {
                const publicMsg = getPublicShout(villageMessages, selectedFriend.id);
                if (publicMsg) {
                  handleMessageTap(publicMsg);
                } else {
                  const existingThread = findDirectThreadId(villageMessages, selectedFriend.id, player.id);
                  if (existingThread) {
                    setActiveThreadId(existingThread);
                    const msgs = getThreadMessages(villageMessages, existingThread);
                    setReplyToMessageId(msgs[msgs.length - 1]?.id ?? null);
                  } else {
                    setPendingChatFriendId(selectedFriend.id);
                    setActiveThreadId(`thread-direct-${selectedFriend.id}`);
                    setReplyToMessageId(null);
                  }
                }
                setSheet(null);
              }}>
                {getPublicShout(villageMessages, selectedFriend.id) ? 'Reply to message' : 'Start a chat'}
              </button>
            </div>
            {actionMsg && <p className="mt-2 text-center text-xs text-gray-500">{actionMsg}</p>}
          </>
        )}
      </VillageSheet>

      <VillageSheet open={sheet === 'object' && !!selectedObject} onClose={() => { setSheet(null); setSelectedObject(null); }} title={selectedObject?.name ?? ''}>
        {selectedObject && (
          <>
            <div className="mb-4 text-center text-5xl">{selectedObject.icon}</div>
            <p className="text-base leading-relaxed text-gray-800">{selectedObject.fact}</p>
          </>
        )}
      </VillageSheet>

      <VillageSheet open={sheet === 'wildlife' && !!selectedWildlife} onClose={() => { setSheet(null); setSelectedWildlife(null); }} title={selectedWildlife?.name ?? ''}>
        {selectedWildlife && (
          <>
            <div className="mb-4 text-center text-5xl">{selectedWildlife.icon}</div>
            <p className="mb-4 rounded-2xl bg-sky-50 p-4 text-base italic leading-relaxed text-gray-800">
              &ldquo;{selectedWildlife.thought}&rdquo;
            </p>
            <button type="button" onClick={() => {
              const msg = bubbleFor(selectedWildlife.id);
              if (msg) handleMessageTap(msg);
              setSheet(null);
            }} className="focus-ring w-full rounded-2xl bg-mint-400 py-3 font-semibold text-white">
              Reply to {selectedWildlife.name}
            </button>
          </>
        )}
      </VillageSheet>

      <HouseExperienceLayer
        house={houseExperience.house}
        phase={houseExperience.phase}
        fade={houseExperience.fade}
        theme={theme}
        atmosphere={atmosphere}
        sproutColor={sprout.color}
        sproutName={sprout.name}
        isPlayerHouse={houseExperience.house?.ownerId === player.id}
        ownedItemIds={houseProgress.ownedItemIds}
        shopUnlocked={isShopUnlocked()}
        currency={currency}
        houseProgress={houseProgress}
        soundEnabled={soundEnabled}
        onBuyItem={(id) => buyHouseItem(id)}
        onRequestExit={handleHouseExit}
        furniturePlacements={furniturePlacements}
        hatOverlay={hatDisplay}
        hatOffset={
          hatAttach
            ? { offsetX: hatAttach.offsetX, offsetY: hatAttach.offsetY, scale: hatAttach.scale }
            : null
        }
      />

      <ShopExperienceLayer
        phase={shopExperience.phase}
        fade={shopExperience.fade}
        soundEnabled={soundEnabled}
      >
        <ShopInteriorView
          onExit={handleShopExit}
          soundEnabled={soundEnabled}
          onEnterPlayerHouse={() => {
            handleShopExit();
            const playerHouse = VILLAGE_HOUSES.find((h) => h.ownerId === player.id);
            if (playerHouse) handleHouseTap(playerHouse);
          }}
        />
      </ShopExperienceLayer>

      {collectMsg && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-amber-800 shadow-lg">
          {collectMsg}
        </div>
      )}
    </div>
  );
}
