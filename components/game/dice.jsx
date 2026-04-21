import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { sendMessage } from "../../Utils/socket";

const DICE_IMAGES = {
  1: require("../../assets/dice/1.jpeg"),
  2: require("../../assets/dice/2.jpeg"),
  3: require("../../assets/dice/3.jpeg"),
  4: require("../../assets/dice/4.jpeg"),
  5: require("../../assets/dice/5.jpeg"),
  6: require("../../assets/dice/6.jpeg"),
};

const ROLL_ANIMATION = require("../../assets/dice/roll.json");

function DiceComponent({
  dice,
  isTurn,
  playerId,
  gameId,
  isTestMode,
  isRolling,
  setIsRolling,
}) {
  const [displayValue, setDisplayValue] = useState(1);

  const prevLengthRef = useRef(0);
  const pendingValueRef = useRef(null);

  const transition = useSharedValue(0);
  const rolledValues = dice?.value || [];

  const canRoll = useMemo(() => {
    return (
      isTurn &&
      !isRolling &&
      (rolledValues.length === 0 || dice?.active === true)
    );
  }, [isTurn, isRolling, rolledValues.length, dice?.active]);

  useEffect(() => {
    const prevLen = prevLengthRef.current;
    const currLen = rolledValues.length;

    if (currLen > prevLen) {
      pendingValueRef.current = rolledValues[currLen - 1];
      setIsRolling(true);
    }

    prevLengthRef.current = currLen;
  }, [rolledValues.length]);

  const handleAnimationFinish = useCallback(() => {
    if (pendingValueRef.current != null) {
      setDisplayValue(pendingValueRef.current);

      transition.value = 0;
      transition.value = withTiming(1, { duration: 180 });
    }

    pendingValueRef.current = null;
    setIsRolling(false);
  }, []);

  const handleRoll = useCallback(() => {
    if (!canRoll) return;

    sendMessage({
      type: isTestMode ? "testing_dice" : "dice",
      game_id: gameId,
      player_id: playerId,
    });
  }, [canRoll, isTestMode, gameId, playerId]);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [
      {
        scale: interpolate(transition.value, [0, 1], [0.85, 1]),
      },
    ],
  }));

  const chips = useMemo(
    () =>
      rolledValues.map((v, i) => (
        <View key={`${v}-${i}`} style={styles.chip}>
          <Text style={styles.chipText}>{v}</Text>
        </View>
      )),
    [rolledValues]
  );

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>{chips}</View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleRoll}
        disabled={!canRoll}
        style={[
          styles.diceButton,
          canRoll ? styles.active : styles.idle,
        ]}
      >
        {isRolling ? (
          <LottieView
            source={ROLL_ANIMATION}
            autoPlay
            loop={false}
            onAnimationFinish={handleAnimationFinish}
            style={styles.lottie}
          />
        ) : (
          <View style={styles.innerDice}>
            <Animated.Image
              source={DICE_IMAGES[displayValue]}
              style={[styles.diceImage, imageStyle]}
            />

            {!canRoll && isTurn && rolledValues.length > 0 && (
              <View style={styles.moveOverlay}>
                <Text style={styles.moveText}>MOVE</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(
  DiceComponent,
  (prev, next) => {
    return (
      prev.dice === next.dice &&
      prev.isTurn === next.isTurn &&
      prev.isRolling === next.isRolling
    );
  }
);

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20 },

  chipsRow: { flexDirection: "row", marginBottom: 12, minHeight: 35 },

  chip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },

  chipText: {
    color: "#22d3ee",
    fontSize: 15,
    fontWeight: "bold",
  },

  diceButton: {
    width: 90,
    height: 90,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  active: {
    borderColor: "#22d3ee",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },

  idle: {
    borderColor: "#334155",
    opacity: 0.65,
  },

  innerDice: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  diceImage: {
    width: "70%",
    height: "70%",
    resizeMode: "contain",
  },

  lottie: {
    width: "100%",
    height: "100%",
  },

  moveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  moveText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});