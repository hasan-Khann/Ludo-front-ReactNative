import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, homeCords, legendCords, mainCords } from "../../constants";
import { sendMessage } from "../../Utils/socket";
import Popover from "../popover";

const { width } = Dimensions.get("window");
const BOARD_SIZE = width - 32;

const pctToPx = (pct) => (pct / 100) * BOARD_SIZE;

const PAWN_SIZE = 26;
const PAWN_HALF = PAWN_SIZE / 2;

const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function PawnComponent({
  id,
  data = [],
  playerId,
  validMoves,
  playerIndex,
  pawnIndex,
  gameId,
  rotation = 0,
  isTurn,
  finishedCount = 1,
  isFirstFinishedPawn = true,
  isTestMode = false,
  stackInfo = { x: 0, y: 0, scale: 1, index: 0 },
}) {
  const [visible, setVisible] = useState(false);

  const [pos, pairId, owner, legendProg, isFinished] = data;

  const safePlayerIndex = playerIndex ?? 0;
  const safePawnIndex = pawnIndex ?? 0;

  const isPlayable =
    isTurn && owner === playerId && (validMoves?.length ?? 0) > 0;

  const playerColor = colors[safePlayerIndex] || "#334155";

  const coords =
    pos === -1 && legendProg === -1
      ? homeCords[safePlayerIndex]?.[safePawnIndex] || { x: 50, y: 50 }
      : legendProg !== -1
        ? legendCords[safePlayerIndex]?.[legendProg] || { x: 50, y: 50 }
        : mainCords[pos] || { x: 50, y: 50 };

  const topPx = useSharedValue(pctToPx(coords.y));
  const leftPx = useSharedValue(pctToPx(coords.x));

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const dynamicScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    topPx.value = withSpring(pctToPx(coords.y));
    leftPx.value = withSpring(pctToPx(coords.x));
  }, [coords.x, coords.y]);

  useEffect(() => {
    const isSafe = SAFE_SQUARES.has(pos) || legendProg !== -1;

    if (isSafe && pos !== -1) {
      offsetX.value = withSpring(stackInfo.x || 0);
      offsetY.value = withSpring(stackInfo.y || 0);
      dynamicScale.value = withSpring(stackInfo.scale || 1);
    } else {
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
      dynamicScale.value = withSpring(1);
    }
  }, [stackInfo.x, stackInfo.y, stackInfo.scale, pos, legendProg]);

  useEffect(() => {
    if (isPlayable) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isPlayable]);

  const animatedStyles = useAnimatedStyle(() => ({
    position: "absolute",
    width: PAWN_SIZE,
    height: PAWN_SIZE,
    top: topPx.value - PAWN_HALF,
    left: leftPx.value - PAWN_HALF,
    zIndex: isPlayable ? 1000 : 50 + (stackInfo.index ?? 0),
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: dynamicScale.value * pulseScale.value },
      { rotate: `${rotation}deg` },
    ],
  }));

  if (isFinished && !isFirstFinishedPawn) return null;
  if (pos !== -1 && pairId && safePawnIndex < parseInt(String(pairId).slice(-1))) return null;
  return (
    <>
      <Animated.View style={animatedStyles}>
        <TouchableOpacity
          onPress={() => setVisible(true)}
          disabled={!isPlayable}
          activeOpacity={0.85}
          style={[
            styles.pawnOuter,
            { backgroundColor: playerColor },
            isPlayable && styles.pawnPlayable,
          ]}
        >
          <View style={styles.pawnInner}>
            {isFinished ? (
              <Text style={styles.pawnText}>{finishedCount}</Text>
            ) : pairId ? (
              <Text style={styles.pawnText}>2</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Popover visible={visible} onClose={() => setVisible(false)}>
        {(validMoves || []).map((m) => (
          <TouchableOpacity
            key={m.index}
            style={styles.moveBtn}
            onPress={() => {
              sendMessage({
                type: isTestMode ? "testing_move" : "move",
                game_id: gameId,
                player_id: owner,
                pawn: id,
                value: m.index,
              });
              setVisible(false);
            }}
          >
            <View style={styles.glassHighlight} />
            <Text style={styles.moveText}>{m.val}</Text>
          </TouchableOpacity>
        ))}
      </Popover>
    </>
  );
}

export default React.memo(
  PawnComponent,
  (prev, next) =>
    prev.data === next.data &&
    prev.validMoves === next.validMoves &&
    prev.isTurn === next.isTurn &&
    prev.stackInfo === next.stackInfo &&
    prev.rotation === next.rotation
);

const styles = StyleSheet.create({
  pawnOuter: {
    width: PAWN_SIZE,
    height: PAWN_SIZE,
    borderRadius: PAWN_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  pawnPlayable: {
    borderWidth: 2,
    shadowOpacity: 0.5,
    elevation: 12,
  },
  pawnInner: {
    width: "40%",
    height: "40%",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  pawnText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#fff",
  },
  moveBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  moveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});