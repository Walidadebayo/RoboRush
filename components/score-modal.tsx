"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Clock,
  RefreshCw,
  Check,
  Loader2,
  WifiOff,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";

interface ScoreModalProps {
  score: number;
  time: number;
  attempts: number;
  playerName: string;
  onClose: () => void;
}

export default function ScoreModal({
  score,
  time,
  attempts,
  playerName,
  onClose,
}: ScoreModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const scoreData = {
      name: playerName,
      score,
      time,
      attempts,
    };

    if (!navigator.onLine) {
      try {
        localStorage.setItem("roborush-player-data", JSON.stringify(scoreData));

        setPendingSync(true);
        setSubmitted(true);
        setSubmitting(false);
      } catch {
        setError("Failed to save offline score. Please try again.");
        setSubmitting(false);
      }
      return;
    }

    try {
      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit scores");
      }

      setPendingSync(false);
      setSubmitted(true);
    } catch {
      setError("Failed to submit score. Please try again.");
      try {
        localStorage.setItem("roborush-player-data", JSON.stringify(scoreData));
      } catch (e) {
        console.error("Error storing offline score:", e);
      }
    } finally {
      setSubmitting(false);
    }
  }, [playerName, score, time, attempts]);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      if (pendingSync) {
        handleSubmit();
      }
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pendingSync, handleSubmit]);

  const syncOfflineScores = async () => {
    if (!navigator.onLine) {
      setError(
        "Cannot sync while offline. Please connect to the internet first."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const playerOfflineData = JSON.parse(
        localStorage.getItem("roborush-player-data") || "{}"
      );

      if (Object.keys(playerOfflineData).length === 0) {
        setPendingSync(false);
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerOfflineData),
      });

      if (!response.ok) {
        throw new Error("Failed to sync offline scores");
      }

      localStorage.removeItem("roborush-player-data");
      setPendingSync(false);
    } catch {
      setError("Failed to sync offline scores. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    try {
      const playerData = JSON.parse(
        localStorage.getItem("roborush-player-data") || "{}"
      );
      setPendingSync(Object.keys(playerData).length > 0);
    } catch (e) {
      console.error("Error checking offline scores:", e);
    }

    const submitScore = setTimeout(() => {
      handleSubmit();
    }, 300);
    return () => clearTimeout(submitScore);
  }, [playerName, score, time, attempts, handleSubmit]);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-xl border border-purple-900/50 shadow-[0_0_30px_rgba(124,58,237,0.3)] max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Game Over!</h2>
            <p className="text-gray-400">
              Your robot has completed the mission.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-xs text-gray-400">NEW SCORE</div>
              <div className="text-xl font-bold text-yellow-400">{score}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-xs text-gray-400">NEW TIME</div>
              <div className="text-xl font-bold text-purple-400">
                {formatTime(time)}
              </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <RefreshCw className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
              <div className="text-xs text-gray-400">NEW ATTEMPTS</div>
              <div className="text-xl font-bold text-cyan-400">{attempts}</div>
            </div>
          </div>

          {isOffline && (
            <div className="mb-4 bg-amber-900/30 border border-amber-600/30 rounded-md p-3 flex items-center text-amber-300">
              <WifiOff className="h-5 w-5 mr-2" />
              <div className="text-sm">
                You&#39;re offline. Your score will be saved locally and
                submitted when you reconnect.
              </div>
            </div>
          )}

          {!submitted ? (
            <div>
              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  Player:{" "}
                  <span className="text-blue-400 font-semibold">
                    {playerName}
                  </span>
                </p>
                {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Score"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {pendingSync && navigator.onLine ? (
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/30 text-amber-400 mb-4">
                    <RefreshCcw className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Offline Scores Pending Sync
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You have scores that haven&#39;t been synchronized yet.
                  </p>
                  <Button
                    onClick={syncOfflineScores}
                    className="w-full mb-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 text-green-400 mb-4">
                  <Check className="h-8 w-8" />
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">
                Score {isOffline ? "Saved" : "Submitted"}!
              </h3>
              <p className="text-gray-400 mb-6">
                {isOffline
                  ? "Your score has been saved locally and will be added to the leaderboard when you're back online."
                  : "Your score has been added to the leaderboard."}
              </p>

              <div className="flex gap-3">
                <Link href="/leaderboard" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    View Leaderboard
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
