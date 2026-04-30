import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

import Dice from "../components/game/dice";
import Pawn from "../components/game/pawn";
import PlayerHud from "../components/game/PlayersHud";
import { closeSocket, getSocket, sendMessage, subscribe } from "../Utils/socket";

const { width } = Dimensions.get("window");
const BOARD_SIZE = width - 32;

const BOARD_IMAGES = {
  0: require("../assets/board/0.jpeg"),
  1: require("../assets/board/0.jpeg"),
  2: require("../assets/board/0.jpeg"),
  3: require("../assets/board/0.jpeg"),
};

const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export default function Online() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const playerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const gameId = Array.isArray(params.game_id) ? params.game_id[0] : params.game_id;
  const isTestMode = params.test_mode === "1";
  const botIds = params.bot_ids ? JSON.parse(params.bot_ids) : [];

  const [game, setGame] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const players = game?.players || {};
  const pawns = game?.pawns || {};
  const dice = game?.dice || { active: false, vals: [] };
  const turn = game?.turn;

  const pawnValues = useMemo(() => Object.values(pawns), [pawns]);

  const localPlayerIndex = useMemo(() => {
    const me = players[playerId];
    return Array.isArray(me) ? me[1] : (me?.index ?? 0);
  }, [players, playerId]);

  const actingPlayerId = isTestMode ? turn : playerId;
  const isTurn = isTestMode ? !!turn : turn === playerId;
  const mustRollAgain = dice.active === actingPlayerId;

  const boardRotationNumber = -localPlayerIndex * 90;
  const antiRotationNumber = localPlayerIndex * 90;

  const getRelativeHudPosition = (targetIdx) => {
    const relativeIndex = (targetIdx - localPlayerIndex + 4) % 4;
    const positions = ["bottomLeft", "topLeft", "topRight", "bottomRight"];
    return positions[relativeIndex];
  };

  useEffect(() => {
    const ws = getSocket();
    const interval = setInterval(() => {
      if (ws && ws.readyState === 1) {
        sendMessage({ type: "state", player_id: playerId, game_id: gameId });
        clearInterval(interval);
      }
    }, 100);

    const unsub = subscribe(async (data) => {
      if (!data) return;
      const payload = data.data || data;

      if (data.type === "sync_state" || data.type === "piece_moved" || data.type === "player_left") {
        setGame(payload);
        if (payload?.game_finished) {
          closeSocket();
          await AsyncStorage.removeItem("id");
          setWinner(payload?.winner || "Opponent");
        }
        return;
      }

      if (data.type === "dice_rolled") {
        setGame((prev) => ({ ...prev, dice: payload.dice }));
        return;
      }

      if (data.type === "next_turn") {
        setGame((prev) => ({ ...prev, turn: payload.turn, dice: { active: false, vals: [] } }));
        return;
      }

      if (data.type === "game_over") {
        closeSocket();
        await AsyncStorage.removeItem("id");
        setWinner(data.winner || "You");
      }
    });

    return () => {
      clearInterval(interval);
      if (unsub) unsub();
    };
  }, [playerId, gameId]);

  // --- VALID MOVES LOGIC ---
  const validMoves = useMemo(() => {
    const moves = {};
    if (!isTurn || !dice?.vals?.length || mustRollAgain) return moves;

    const pIdx = Array.isArray(players[actingPlayerId]) 
      ? players[actingPlayerId][1] 
      : players[actingPlayerId]?.index;

    const legendEntries = [50, 11, 24, 37];
    const entrySq = legendEntries[pIdx];

    const isMainBoardBlocked = (startPos, steps, isDouble) => {
      if (isDouble) return false;
      for (let s = 1; s <= steps; s++) {
        const checkPos = (startPos + s) % 52;
        let count = 0;
        let owner = null;
        for (const p of pawnValues) {
          if (p[0] === checkPos && p[3] === -1 && p[0] !== -1) {
            count++;
            owner = p[2];
          }
        }
        if (count >= 2 && owner !== actingPlayerId) return true;
      }
      return false;
    };

    const isLegendPathBlocked = (startProg, steps, isDouble) => {
      if (isDouble) return false;
      for (let s = 1; s <= steps; s++) {
        const checkProg = startProg + s;
        let count = 0;
        for (const p of pawnValues) {
          if (p[2] === actingPlayerId && p[3] === checkProg) count++;
        }
        if (count >= 2) return true;
      }
      return false;
    };

    const formsTriplet = (targetPos, isLegend, targetLegendProg, isDouble) => {
      const movingCount = isDouble ? 2 : 1;
      let existingCount = 0;
      for (const p of pawnValues) {
        if (p[2] !== actingPlayerId || p[0] === -1 || p[4]) continue;
        if (isLegend) {
          if (p[3] === targetLegendProg) existingCount++;
        } else {
          if (p[0] === targetPos && p[3] === -1) existingCount++;
        }
      }
      return existingCount + movingCount > 2;
    };

    Object.entries(pawns).forEach(([pawnId, pawnData]) => {
      if (!pawnData || pawnData[2] !== actingPlayerId || pawnData[4]) return;
      const [pos, pairId, , legendProg] = pawnData;
      const isDouble = pairId !== null;
      moves[pawnId] = [];

      dice.vals.forEach((val, index) => {
        if (isDouble && val % 2 !== 0) return;
        const step = isDouble ? val / 2 : val;

        if (pos === -1) {
          if (val === 6) {
            const startSq = [0, 13, 26, 39][pIdx];
            if (!formsTriplet(startSq, false, -1, isDouble)) moves[pawnId].push({ index, val });
          }
          return;
        }

        if (legendProg !== -1) {
          if (step > 0 && legendProg + step <= 6) {
            if (!isLegendPathBlocked(legendProg, step, isDouble)) {
              if (!formsTriplet(-1, true, legendProg + step, isDouble)) moves[pawnId].push({ index, val });
            }
          }
          return;
        }

        const distToEntry = (entrySq - pos + 52) % 52;
        if (step > distToEntry) {
          const pathSteps = step - distToEntry;
          if (pathSteps <= 6 && !isMainBoardBlocked(pos, distToEntry, isDouble) && !isLegendPathBlocked(0, pathSteps, isDouble)) {
            if (!formsTriplet(-1, true, pathSteps, isDouble)) moves[pawnId].push({ index, val });
          }
        } else {
          const targetPos = (pos + step) % 52;
          if (!isMainBoardBlocked(pos, step, isDouble)) {
            if (!formsTriplet(targetPos, false, -1, isDouble)) moves[pawnId].push({ index, val });
          }
        }
      });
    });
    return moves;
  }, [turn, dice, pawnValues, players, actingPlayerId, isTurn, mustRollAgain]);

  const pawnOffsets = useMemo(() => {
    const map = {};
    const offsets = {};
    Object.entries(pawns).forEach(([pawnId, data]) => {
      const pos = data[0];
      const legendProg = data[3];
      if (pos === -1 || data[4]) return;
      const key = legendProg !== -1 ? `leg_${legendProg}` : `pos_${pos}`;
      if (!map[key]) map[key] = [];
      map[key].push(pawnId);
    });

    Object.entries(map).forEach(([key, groupIds]) => {
      const isSafe = key.startsWith("leg_") || SAFE_SQUARES.has(parseInt(key.split("_")[1]));
      const count = groupIds.length;
      groupIds.forEach((id, index) => {
        let out = { x: 0, y: 0, scale: 1, index };
        if (isSafe && count > 1) {
          out.scale = 0.8;
          const gap = 7;
          if (count === 2) out.x = index === 0 ? -gap : gap;
          else if (count === 3) {
            if (index === 0) out.y = -gap;
            else if (index === 1) { out.y = gap; out.x = -gap; }
            else { out.y = gap; out.x = gap; }
          } else {
            out.x = index % 2 === 0 ? -gap : gap;
            out.y = index < 2 ? -gap : gap;
          }
        }
        offsets[id] = out;
      });
    });
    return offsets;
  }, [pawns]);

  useEffect(() => {
    if (isTurn && dice.vals.length > 0 && !mustRollAgain && !isRolling) {
      const totalMoves = Object.values(validMoves).reduce((a, m) => a + m.length, 0);
      if (totalMoves === 0) {
        const t = setTimeout(() => {
          sendMessage({ type: "next_turn", game_id: gameId, player_id: actingPlayerId });
        }, 1200);
        return () => clearTimeout(t);
      }
    }
  }, [isTurn, validMoves, isRolling, mustRollAgain]);

  const handleLeaveGame = () => {
    Alert.alert("Leave Match", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Leave",
        onPress: async () => {
          if (playerId) sendMessage({ type: "leave", player_id: playerId });
          closeSocket();
          await AsyncStorage.removeItem("id");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#1e293b", "#0f172a", "#020617"]} className="flex-1">
      {/* HEADER SECTION */}
      <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-50">
        <TouchableOpacity onPress={handleLeaveGame}>
          <Ionicons name="exit-outline" size={26} color="#ef4444" />
        </TouchableOpacity>
        <View>
          <Text className="text-slate-300 text-xs">
            Match: {gameId?.slice(0, 5).toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        {/* BOARD AND HUD CONTAINER */}
        <View style={{
          width: BOARD_SIZE + 24,
          height: BOARD_SIZE + 24,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ rotate: `${boardRotationNumber}deg` }]
        }}>
          {Object.entries(players).map(([id, data]) => {
            if (!data) return null;
            const pIdx = Array.isArray(data) ? data[1] : data?.index;
            return (
              <PlayerHud
                key={id}
                playerId={id}
                playerData={data}
                isTurn={turn === id}
                position={getRelativeHudPosition(pIdx)}
                isBot={!!botIds?.includes(id)}
                antiRotation={antiRotationNumber}
              />
            );
          })}

          <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
            <Image 
              source={BOARD_IMAGES[localPlayerIndex]} 
              style={{ width: '100%', height: '100%' }} 
            />

            {Object.entries(pawns).map(([pId, pData]) => {
              const owner = pData[2];
              const pIdx = players[owner]?.[1];
              const pawnNum = parseInt(pId.split("_p")[1], 10);
              const extractedPawnIndex = isNaN(pawnNum) ? 0 : pawnNum - 1;

              return (
                <Pawn
                  key={pId}
                  id={pId}
                  data={pData}
                  playerId={actingPlayerId}
                  isTurn={isTurn}
                  validMoves={validMoves[pId] || []}
                  playerIndex={pIdx}
                  pawnIndex={extractedPawnIndex}
                  gameId={gameId}
                  rotation={antiRotationNumber}
                  isTestMode={isTestMode}
                  stackInfo={pawnOffsets[pId] || { x: 0, y: 0, scale: 1, index: 0 }}
                />
              );
            })}
          </View>
        </View>

        {/* DICE SECTION */}
        <Dice
          dice={{ active: mustRollAgain, value: dice.vals }}
          isTurn={isTurn}
          playerId={actingPlayerId}
          gameId={gameId}
          isTestMode={isTestMode}
          isRolling={isRolling}
          setIsRolling={setIsRolling}
        />
      </View>

      {/* WINNER OVERLAY */}
      {!!winner && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-[100]">
           <Text className="text-white text-3xl font-bold mb-4">Winner: {winner}</Text>
           <TouchableOpacity 
             className="bg-blue-600 px-8 py-3 rounded-full"
             onPress={() => router.replace("/")}
           >
             <Text className="text-white font-bold">Back to Home</Text>
           </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}