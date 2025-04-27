"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play, Heart, Zap } from "lucide-react";
import ScoreModal from "@/components/score-modal";
import GameEngine from "@/components/game-engine";
import PlayerNameModal from "@/components/player-name-modal";
import AIAssistantButton from "@/components/ai-assistant-button";

export default function PlayGame() {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRestarted, setIsRestarted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [gameData, setGameData] = useState<{
    score: number;
    time: number;
    attempts: number;
    playerName?: string;
  }>({
    score: 0,
    time: 0,
    attempts: 1,
    playerName: "",
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasAttemptedSync = useRef(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const syncOfflineData = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    const localData = localStorage.getItem("roborush-player-data");
    const playerNameFromStorage = localStorage.getItem("roborush-player-name");

    if (!localData || !playerNameFromStorage) return;

    try {
      setIsSyncing(true);

      const localStats = JSON.parse(localData);

      const response = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerNameFromStorage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch player data");
      }

      const serverData = await response.json();

      const needsSync =
        !serverData ||
        localStats.score > (serverData.score || 0) ||
        localStats.time > (serverData.time || 0) ||
        localStats.attempts > (serverData.attempts || 1);

      if (needsSync) {
        const syncResponse = await fetch("/api/submit-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: playerNameFromStorage,
            score: localStats.score,
            time: localStats.time,
            attempts: localStats.attempts,
          }),
        });

        if (syncResponse.ok) {
          console.log("Successfully synced offline progress!");

          setGameData({
            score: localStats.score,
            time: localStats.time,
            attempts: localStats.attempts,
            playerName: playerNameFromStorage,
          });
          setScore(localStats.score);
          setTime(localStats.time);
          setAttempts(localStats.attempts);
        } else {
          throw new Error("Failed to sync data with server");
        }
      }
    } catch (error) {
      console.error("Error syncing offline data:", error);
    } finally {
      setIsSyncing(false);
      hasAttemptedSync.current = true;
    }
  }, [isSyncing]);
  useEffect(() => {
    const handleOnlineStatus = () => {
      const wasOffline = isOffline;
      const currentlyOffline = !navigator.onLine;

      setIsOffline(currentlyOffline);

      if (wasOffline && !currentlyOffline) {
        syncOfflineData();
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [isOffline, syncOfflineData]);

  const fetchPlayerData = useCallback(
    async (playerName: string) => {
      fetch("/api/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: playerName }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.attempts) {
            const cachedDataStr = localStorage.getItem("roborush-player-data");
            if (cachedDataStr) {
              try {
                const cachedData = JSON.parse(cachedDataStr);

                const mergedData = {
                  score: Math.max(data.score || 0, cachedData.score || 0),
                  time: Math.max(data.time || 0, cachedData.time || 0),
                  attempts: Math.max(
                    data.attempts || 1,
                    cachedData.attempts || 1
                  ),
                  playerName: playerName,
                };

                setAttempts(mergedData.attempts);
                setTime(mergedData.time);
                setScore(mergedData.score);
                setGameData(mergedData);

                localStorage.setItem(
                  "roborush-player-data",
                  JSON.stringify({
                    score: mergedData.score,
                    time: mergedData.time,
                    attempts: mergedData.attempts,
                  })
                );

                if (
                  cachedData.score > data.score ||
                  cachedData.time > data.time ||
                  cachedData.attempts > data.attempts
                ) {
                  syncOfflineData();
                }
              } catch (e) {
                console.error("Error processing cached data:", e);
                setAttempts(data.attempts);
                setTime(data.time);
                setScore(data.score);
                setGameData({
                  score: data.score,
                  time: data.time,
                  attempts: data.attempts,
                  playerName: playerName,
                });
              }
            } else {
              setAttempts(data.attempts);
              setTime(data.time);
              setScore(data.score);
              setGameData({
                score: data.score,
                time: data.time,
                attempts: data.attempts,
                playerName: playerName,
              });

              localStorage.setItem(
                "roborush-player-data",
                JSON.stringify({
                  score: data.score,
                  time: data.time,
                  attempts: data.attempts,
                })
              );
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching player data:", error);
          UseCachedPlayerData(playerName);
        });
    },
    [syncOfflineData]
  );

  useEffect(() => {
    const savedName = localStorage.getItem("roborush-player-name");
    if (savedName) {
      setPlayerName(savedName);

      if (navigator.onLine) {
        fetchPlayerData(savedName);
      } else {
        UseCachedPlayerData(savedName);
      }
    }
  }, [syncOfflineData, fetchPlayerData]);

  const UseCachedPlayerData = (playerName: string) => {
    const cachedDataStr = localStorage.getItem("roborush-player-data");
    if (cachedDataStr) {
      try {
        const cachedData = JSON.parse(cachedDataStr);
        setAttempts(cachedData.attempts || 1);
        setTime(cachedData.time || 0);
        setScore(cachedData.score || 0);
        setGameData({
          score: cachedData.score || 0,
          time: cachedData.time || 0,
          attempts: cachedData.attempts || 1,
          playerName: playerName,
        });
      } catch (e) {
        console.error("Error parsing cached player data:", e);
      }
    }
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    fetchPlayerData(name);
    setShowNameModal(false);
    startGame();
    setShowNameModal(false);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.game) {
        try {
          if (window.game.sound && window.game.sound.sounds) {
            window.game.sound.sounds.forEach(
              (sound: { isPlaying: boolean; stop: () => void }) => {
                if (sound.isPlaying) {
                  sound.stop();
                }
              }
            );
          }

          window.game.destroy(true);
          window.game = null;
        } catch (e) {
          console.error("Error cleaning up game:", e);
        }
      }
    };
  }, []);

  const handleCloseModal = () => {
    setIsGameOver(false);
    setGameStarted(false);
    setIsPaused(false);
    setScore(gameData?.score || 0);
    setTime(gameData?.time || 0);
    setAttempts(gameData?.attempts || 1);
    setLives(3);
    setIsAiActive(false);

    if (typeof window !== "undefined" && window.game) {
      try {
        if (window.game.sound && window.game.sound.sounds) {
          window.game.sound.sounds.forEach(
            (sound: { isPlaying: boolean; stop: () => void }) => {
              if (sound.isPlaying) {
                sound.stop();
              }
            }
          );
        }

        window.game.destroy(true);
        window.game = null;
      } catch (e) {
        console.error("Error cleaning up game:", e);
      }
    }

    const canvases = document.querySelectorAll("canvas");
    canvases.forEach((canvas) => canvas.remove());
  };

  const startGame = () => {
    if (!playerName) {
      setShowNameModal(true);
      return;
    }

    if (typeof window !== "undefined" && window.game) {
      try {
        if (window.game.sound && window.game.sound.sounds) {
          window.game.sound.sounds.forEach(
            (sound: { isPlaying: boolean; stop: () => void }) => {
              if (sound.isPlaying) {
                sound.stop();
              }
            }
          );
        }

        window.game.destroy(true);
        window.game = null;
      } catch (e) {
        console.error("Error cleaning up game:", e);
      }
    }

    const canvases = document.querySelectorAll("canvas");
    canvases.forEach((canvas) => canvas.remove());

    setIsGameOver(false);
    setIsPaused(false);
    setLives(3);
    setScore(0);
    setTime(0);
    setAttempts(1);

    setTimeout(() => {
      setGameStarted(true);
    }, 100);
  };

  const restartGame = () => {
    setIsRestarted(true);
    setAttempts((prev) => prev + 1);
    setLives(3);
    setScore(0);
    setTime(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleTimeUpdate = (newTime: number) => {
    setTime(newTime);
  };

  const handleLivesUpdate = (newLives: number) => {
    setLives(newLives);
  };

  const handleGameOver = (data: {
    score: number;
    time: number;
    attempts: number;
  }) => {
    setGameData((prev) => {
      const newData = {
        ...prev,
        score: data.score + (prev.score || 0),
        time: data.time + (prev.time || 0),
        attempts: data.attempts + (prev.attempts || 1),
      };

      localStorage.setItem(
        "roborush-player-data",
        JSON.stringify({
          score: newData.score,
          time: newData.time,
          attempts: newData.attempts,
        })
      );

      return newData;
    });

    setIsGameOver(true);
  };

  const handleActivateAI = () => {
    setIsAiActive(true);
  };

  const handleDeactivateAI = () => {
    setIsAiActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderHearts = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <Heart
          key={i}
          className={`h-4 w-4 ${
            i < lives ? "text-red-500 fill-red-500" : "text-gray-600"
          }`}
        />
      ));
  };

  return (
    <div className="flex flex-col items-center my-20">
      {isOffline && (
        <div className="w-full max-w-5xl mb-4 bg-amber-900/30 border border-amber-700 text-amber-300 p-3 rounded-md">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            You&#39;re currently playing offline. Your scores will be saved
            locally and synced when you&#39;re back online.
          </p>
        </div>
      )}

      {isSyncing && (
        <div className="w-full max-w-5xl mb-4 bg-blue-900/30 border border-blue-700 text-blue-300 p-3 rounded-md">
          <p className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Synchronizing your game data...
          </p>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex flex-wrap gap-2">
            {gameStarted && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePause}
                  className="border-blue-500 text-blue-400 hover:bg-blue-950 hover:text-blue-300"
                  disabled={!gameStarted || isGameOver}
                >
                  {isPaused ? (
                    <Play className="h-4 w-4 mr-1" />
                  ) : (
                    <Pause className="h-4 w-4 mr-1" />
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartGame}
                  disabled={!gameStarted || isGameOver}
                  className="border-purple-500 text-purple-400 hover:bg-purple-950 hover:text-purple-300"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
                <AIAssistantButton
                  isGameStarted={gameStarted}
                  isGameOver={isGameOver}
                  isPaused={isPaused}
                  onActivate={handleActivateAI}
                  onDeactivate={handleDeactivateAI}
                />
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-800 px-4 py-2 rounded-md border border-blue-900/50">
              <span className="text-gray-400 text-xs block">
                {!gameStarted && "TOTAL"} SCORE
              </span>
              <span className="text-blue-400 font-bold">{score}</span>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-md border border-purple-900/50">
              <span className="text-gray-400 text-xs block">
                {!gameStarted && "TOTAL"} TIME
              </span>
              <span className="text-purple-400 font-bold">
                {formatTime(time)}
              </span>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-md border border-cyan-900/50">
              <span className="text-gray-400 text-xs block">
                {!gameStarted && "TOTAL"} ATTEMPTS
              </span>
              <span className="text-cyan-400 font-bold">{attempts}</span>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-md border border-red-900/50">
              <span className="text-gray-400 text-xs block">LIVES</span>
              <div className="flex gap-1 text-red-400 font-bold">
                {renderHearts()}
              </div>
            </div>
          </div>
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-800/50 rounded-xl border border-purple-900/50 px-4 py-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              Ready to Play?
            </h2>
            {playerName && (
              <p className="text-gray-300 mb-2">
                Welcome back,{" "}
                <span className="text-blue-400 font-semibold">
                  {playerName}
                </span>
                !
              </p>
            )}
            <p className="text-gray-300 mb-6 text-center max-w-md">
              Navigate your robot through the maze, collect all energy orbs, and
              avoid hazards to achieve the highest score!
            </p>
            <div className="mb-8 text-gray-400 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div>Move: Arrow Keys or WASD or Joystick (mobile)</div>
                <div>Collect: Energy Orbs</div>
                <div>Avoid: Rotating Hazards</div>
                <div>Goal: Collect All Orbs</div>
                <div>Lives: 3 Hearts</div>
                <div>Time: 60 Seconds</div>
                <div>Score: +100 per Orb</div>
                <div>Time Bonus: +200 Points</div>
                <div>AI Assist: Use AI to automate gameplay - +50 Points</div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4"/> Boost Speed: Use boost mode to speed up the robot- +50
                  points
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={startGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)] transition-all duration-300"
            >
              START GAME
            </Button>
          </div>
        ) : (
          <div
            id="game-container"
            ref={gameContainerRef}
            className={`relative h-[60vh] bg-gray-800/50 rounded-xl border border-purple-900/50 overflow-hidden ${
              isPaused ? "opacity-50" : ""
            }`}
          >
            <GameEngine
              onScoreUpdate={handleScoreUpdate}
              onTimeUpdate={handleTimeUpdate}
              onGameOver={handleGameOver}
              onLivesUpdate={handleLivesUpdate}
              isPaused={isPaused}
              gameStarted={gameStarted}
              attempts={attempts}
              playerName={playerName}
              lives={lives}
              isRestarted={isRestarted}
              isAiActive={isAiActive}
            />

            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-2xl font-bold text-white bg-black/70 px-6 py-3 rounded-lg">
                  GAME PAUSED
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isGameOver && gameData && (
        <ScoreModal
          score={gameData.score}
          time={gameData.time}
          attempts={gameData.attempts}
          playerName={gameData.playerName || ""}
          onClose={handleCloseModal}
        />
      )}

      <PlayerNameModal isOpen={showNameModal} onSubmit={handleNameSubmit} />
    </div>
  );
}
