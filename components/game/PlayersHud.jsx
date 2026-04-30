import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_AVATAR = {
  uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
};

const PLAYER_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

const POSITIONS = {
  bottomLeft: { bottom: 0, left: 0 },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomRight: { bottom: 0, right: 0 },
};

function PlayerHud({
  playerId,
  playerData,
  isTurn,
  position,
  hasLeft,
  isBot,
  rotation = 0
}) {
  const [finishedCount, playerIndex] = Array.isArray(playerData)
    ? playerData
    : [0, playerData?.index || 0];

  const accentColor =
    PLAYER_COLORS[playerIndex] || "#64748b";

  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isTurn && !hasLeft) {
      scale.value = withTiming(1.06, { duration: 220 });
      glow.value = withTiming(0.9, { duration: 220 });

      setTimeout(() => {
        scale.value = withTiming(1, { duration: 220 });
        glow.value = withTiming(0.2, { duration: 220 });
      }, 220);
    } else {
      cancelAnimation(scale);
      cancelAnimation(glow);

      scale.value = withTiming(1, { duration: 150 });
      glow.value = withTiming(0, { duration: 150 });
    }
  }, [isTurn, hasLeft]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const posStyle = POSITIONS[position] || { display: "none" };

  return (
    <Animated.View style={[styles.container, posStyle, animatedStyle]}>
      
      {isTurn && !hasLeft ? (
        <Animated.View
          style={[
            styles.glowRing,
            { borderColor: accentColor },
            glowStyle,
          ]}
        />
      ) : null}

      <View
        style={[
          styles.avatarBox,
          isTurn ? { borderColor: accentColor } : null,
          hasLeft ? styles.avatarBoxLeft : null,
        ]}
      >
        <Image
          source={DEFAULT_AVATAR}
          style={[
            styles.avatar,
            hasLeft ? styles.avatarDisabled : null,
          ]}
        />

        {/* Controls */}
        <View style={styles.controlsRow}>
          <Ionicons name="mic" size={10} color="#fff" />
          <Ionicons name="volume-high" size={10} color="#fff" />
        </View>

        {/* Finished pieces */}
        {finishedCount > 0 ? (
          <View
            style={[
              styles.finishedPip,
              { backgroundColor: accentColor },
            ]}
          >
            <Text style={styles.finishedPipText}>
              {finishedCount}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Player name */}
      <View
        style={[
          styles.nameTag,
          isTurn ? { borderColor: accentColor } : null,
        ]}
      >
        <Text style={styles.nameText} numberOfLines={1}>
          {isBot
            ? "BOT"
            : playerId
            ? playerId.substring(0, 5)
            : `P${playerIndex + 1}`}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    width: 70,
    zIndex: 20,
  },

  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 18,
    borderWidth: 2,
  },

  avatarBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    overflow: "hidden",
  },

  avatarBoxLeft: {
    opacity: 0.5,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarDisabled: {
    tintColor: "gray",
  },

  controlsRow: {
    position: "absolute",
    bottom: 2,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  finishedPip: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  finishedPipText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },

  nameTag: {
    marginTop: 4,
    backgroundColor: "#1e293b",
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },

  nameText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default memo(PlayerHud);