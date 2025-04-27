"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";

interface AIAssistantButtonProps {
  isGameStarted: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

export default function AIAssistantButton({
  isGameStarted,
  isGameOver,
  isPaused,
  onActivate,
  onDeactivate,
}: AIAssistantButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Reset state when game is over or paused
  useEffect(() => {
    if (isGameOver || !isGameStarted) {
      setIsActive(false);
      setCooldown(0);
      setTimeRemaining(0);
    }
  }, [isGameOver, isGameStarted]);

  const handleActivate = () => {
    if (
      !isActive &&
      cooldown === 0 &&
      isGameStarted &&
      !isGameOver &&
      !isPaused
    ) {
      setIsActive(true);
      onActivate();

      let timeLeft = 10;
      setTimeRemaining(timeLeft);

      const countdownInterval = setInterval(() => {
        timeLeft--;
        setTimeRemaining(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          setIsActive(false);
          onDeactivate();

          let cooldownLeft = 15;

          const cooldownInterval = setInterval(() => {
            cooldownLeft--;
            setCooldown(cooldownLeft);

            if (cooldownLeft <= 0) {
              clearInterval(cooldownInterval);
              setCooldown(0);
            }
          }, 1000);
        }
      }, 1000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleActivate}
      disabled={
        isActive || cooldown > 0 || !isGameStarted || isGameOver || isPaused
      }
      className={`
        ${
          isActive
            ? "bg-green-900/30 border-green-500 text-green-400 hover:bg-green-900/50 hover:text-green-300"
            : "border-cyan-500 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300"
        }
        ${cooldown > 0 ? "opacity-70" : ""}
        transition-all duration-300
      `}
    >
      {isActive ? (
        <>
          <Bot className="h-4 w-4 mr-1 animate-pulse" />
          AI Active ({timeRemaining}s)
        </>
      ) : cooldown > 0 ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Cooldown ({cooldown}s)
        </>
      ) : (
        <>
          <Bot className="h-4 w-4 mr-1" />
          AI Assist
        </>
      )}
    </Button>
  );
}
