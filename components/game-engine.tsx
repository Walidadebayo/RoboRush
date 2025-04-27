/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Zap } from "lucide-react";

interface GameEngineProps {
  onScoreUpdate?: (score: number) => void;
  onTimeUpdate?: (time: number) => void;
  onLivesUpdate?: (lives: number) => void;
  onGameOver?: (data: {
    score: number;
    time: number;
    attempts: number;
  }) => void;
  isPaused?: boolean;
  gameStarted?: boolean;
  attempts?: number;
  playerName?: string;
  lives?: number;
  isRestarted?: boolean;
  isAiActive?: boolean;
}

export default function GameEngine({
  onScoreUpdate,
  onTimeUpdate,
  onLivesUpdate,
  onGameOver,
  isPaused = false,
  gameStarted = false,
  attempts = 1,
  playerName = "",
  lives = 3,
  isRestarted = false,
  isAiActive = false,
}: GameEngineProps) {
  const gameInitialised = useRef(false);
  const phaserLoaded = useRef(false);
  const isMobile = useIsMobile();
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [isBoostOnCooldown, setIsBoostOnCooldown] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  useEffect(() => {
    // Create a global event listener for game events asissta
    const handleGameEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;

      switch (type) {
        case "scoreUpdate":
          if (onScoreUpdate) onScoreUpdate(data.score);
          break;
        case "timeUpdate":
          if (onTimeUpdate) onTimeUpdate(data.time);
          break;
        case "livesUpdate":
          if (onLivesUpdate) onLivesUpdate(data.lives);
          break;
        case "gameOver":
          if (onGameOver) onGameOver(data);
          break;
      }
    };

    window.addEventListener(
      "game-event" as keyof WindowEventMap,
      handleGameEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "game-event" as keyof WindowEventMap,
        handleGameEvent as EventListener
      );
    };
  }, [onScoreUpdate, onTimeUpdate, onLivesUpdate, onGameOver]);

  const handlePhaserLoaded = useCallback(() => {
    phaserLoaded.current = true;
    if (gameStarted && !gameInitialised.current) {
      try {
        initGame(attempts, isMobile, playerName, isMuted, lives);
        gameInitialised.current = true;
      } catch (error) {
        console.error("Error initialising game:", error);
        setLoadingError(
          "Failed to initialise game. Please refresh the page and try again."
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhaserError = useCallback(() => {
    setLoadingError(
      "Failed to load game engine. Please check your internet connection and try again."
    );
  }, []);

  // Add cleanup when component unmounts
  useEffect(() => {
    // Add Script tag to load Phaser
    const scriptElement = document.createElement("script");
    scriptElement.src =
      "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js";
    scriptElement.async = true;
    scriptElement.onload = handlePhaserLoaded;
    scriptElement.onerror = (e) => {
      console.error("Error loading Phaser from CDN:", e);
      setLoadingError("Trying offline mode...");

      const backupScript = document.createElement("script");
      backupScript.src = "/phaser.min.js";
      backupScript.async = true;
      backupScript.onload = handlePhaserLoaded;
      backupScript.onerror = handlePhaserError;
      document.body.appendChild(backupScript);
    };
    document.body.appendChild(scriptElement);

    return () => {
      // Cleanup when component is unmounted
      if (typeof window !== "undefined" && window.game) {
        try {
          // Stop all audio
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

          gameInitialised.current = false;
        } catch (e) {
          console.error("Error cleaning up game:", e);
        }
      }
    };
  }, [handlePhaserError, handlePhaserLoaded]);

  useEffect(() => {
    if (!gameStarted) {
      gameInitialised.current = false;

      if (typeof window !== "undefined") {
        const canvases = document
          .getElementById("game-container")
          ?.querySelectorAll("canvas");
        if (canvases && canvases.length > 0) {
          canvases.forEach((canvas) => canvas.remove());
        }
      }
    }
  }, [gameStarted]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      phaserLoaded.current &&
      gameStarted &&
      !gameInitialised.current
    ) {
      try {
        if (window.game) {
          if (window.game.sound && window.game.sound.sounds) {
            window.game.sound.sounds.forEach((sound: { isPlaying: boolean; stop: () => void }) => {
              if (sound.isPlaying) {
                sound.stop();
              }
            });
          }
          window.game.destroy(true);
          window.game = null;
        }

        const canvases = document
          .getElementById("game-container")
          ?.querySelectorAll("canvas");
        if (canvases && canvases.length > 0) {
          canvases.forEach((canvas) => canvas.remove());
        }

        initGame(attempts, isMobile, playerName, isMuted, lives);
        gameInitialised.current = true;
      } catch (error) {
        console.error("Error initialising game:", error);
        setLoadingError(
          "Failed to initialise game. Please refresh the page and try again."
        );
      }
    }
  }, [
    gameStarted,
    attempts,
    isMobile,
    playerName,
    isMuted,
    lives,
    isRestarted,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.game) {
      if (isPaused) {
        try {
          const gameScene = window.game.scene.getScene("GameScene");
          if (gameScene) {
            gameScene.scene.pause();
            gameScene.music.pause();
          }
        } catch (e) {
          console.error("Error pausing game:", e);
        }
      } else if (gameStarted && gameInitialised.current) {
        try {
          const gameScene = window.game.scene.getScene("GameScene");
          if (gameScene) {
            gameScene.scene.resume();
            gameScene.music.resume();
          }
        } catch (e) {
          console.error("Error resuming game:", e);
        }
      }
    }
  }, [isPaused, gameStarted]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.game) {
      try {
        const gameScene = window.game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.setMuted(isMuted);
        }
      } catch (e) {
        console.error("Error updating mute state:", e);
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const activateBoost = () => {
    if (isBoostOnCooldown || !gameStarted || isPaused) return;

    setIsBoostActive(true);
    setIsBoostOnCooldown(true);

    let timeLeft = 10;
    setBoostTimeLeft(timeLeft);

    const boostTimer = setInterval(() => {
      timeLeft--;
      setBoostTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(boostTimer);
        setIsBoostActive(false);

        let cooldownLeft = 15;
        const cooldownTimer = setInterval(() => {
          cooldownLeft--;
          setCooldownTimeLeft(cooldownLeft);
          if (cooldownLeft <= 0) {
            clearInterval(cooldownTimer);
            setIsBoostOnCooldown(false);
          }
        }, 1000);
      }
    }, 1000);
  };

  useEffect(() => {
    if (isRestarted && gameStarted && window.game) {
      try {
        const gameScene = window.game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.attempts = attempts;
          gameScene.resetGame();
        }
      } catch (e) {
        console.error("Error restarting game:", e);
      }
    }
  }, [isRestarted, attempts, gameStarted]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.game) {
      window.game.attempts = attempts;

      try {
        const gameScene = window.game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.attempts = attempts;
        }
      } catch (e) {
        console.error("Error updating attempts:", e);
      }
    }
  }, [attempts]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.game) {
      try {
        const gameScene = window.game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.setBoost(isBoostActive);
        }
      } catch (e) {
        console.error("Error updating boost state:", e);
      }
    }
  }, [isBoostActive]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.game) {
      try {
        const gameScene = window.game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.setAIAssistant(isAiActive);
        }
      } catch (e) {
        console.error("Error updating AI state:", e);
      }
    }
  }, [isAiActive]);

  return (
    <>
      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg max-w-md text-center">
            <p className="font-bold mb-2">Error</p>
            <p>{loadingError}</p>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={activateBoost}
            disabled={isBoostOnCooldown || !gameStarted || isPaused}
            className={`relative ${
              isBoostActive
                ? "bg-yellow-600/70 hover:bg-yellow-600/90 text-yellow-100"
                : !isBoostOnCooldown
                ? "bg-green-600/50 hover:bg-green-700/70 text-green-300 hover:text-green-100"
                : "bg-gray-800/50 hover:bg-gray-700/70 text-blue-300 hover:text-blue-100"
            }`}
            title={
              isBoostOnCooldown ? "Boost on cooldown" : "Activate speed boost"
            }
          >
            <Zap
              className={`h-5 w-5 ${
                !isBoostActive && !isBoostOnCooldown && "animate-ping"
              }`}
            />
            {isBoostActive && (
              <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs text-black font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {boostTimeLeft}
              </span>
            )}
            {isBoostOnCooldown && !isBoostActive && (
              <span className="absolute -bottom-1 -right-1 bg-gray-500 text-xs text-black font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cooldownTimeLeft}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 hover:text-white"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {isMobile && gameStarted && !isPaused && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="touch-none">
            <VirtualJoystick />
          </div>
        </div>
      )}
    </>
  );
}

function VirtualJoystick() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxDistance = 40; // Maximum distance the stick can move from center

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setActive(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!active || !joystickRef.current || !stickRef.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const joystick = joystickRef.current.getBoundingClientRect();

      // Calculate the center of the joystick
      const centerX = joystick.left + joystick.width / 2;
      const centerY = joystick.top + joystick.height / 2;

      // Calculate the distance from center
      let deltaX = touch.clientX - centerX;
      let deltaY = touch.clientY - centerY;

      // Calculate the distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If the distance is greater than maxDistance, normalize it
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }

      // Update stick position
      setPosition({ x: deltaX, y: deltaY });

      // Send movement commands to the game
      if (window.game) {
        try {
          const gameScene = window.game.scene.getScene("GameScene");
          if (gameScene) {
            gameScene.setTouchInput(deltaX, deltaY);
          }
        } catch (e) {
          console.error("Error sending touch input:", e);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setActive(false);
      setPosition({ x: 0, y: 0 });

      // Reset movement in the game
      if (window.game) {
        try {
          const gameScene = window.game.scene.getScene("GameScene");
          if (gameScene) {
            gameScene.setTouchInput(0, 0);
          }
        } catch (e) {
          console.error("Error resetting touch input:", e);
        }
      }
    };

    const joystick = joystickRef.current;
    if (joystick) {
      joystick.addEventListener("touchstart", handleTouchStart);
      joystick.addEventListener("touchmove", handleTouchMove);
      joystick.addEventListener("touchend", handleTouchEnd);
      joystick.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      if (joystick) {
        joystick.removeEventListener("touchstart", handleTouchStart);
        joystick.removeEventListener("touchmove", handleTouchMove);
        joystick.removeEventListener("touchend", handleTouchEnd);
        joystick.removeEventListener("touchcancel", handleTouchEnd);
      }
    };
  }, [active]);

  return (
    <div
      ref={joystickRef}
      className="w-32 h-32 rounded-full bg-gray-800/70 border-2 border-purple-500/50 relative touch-none"
    >
      <div
        ref={stickRef}
        className="w-16 h-16 rounded-full bg-purple-600/80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          transition: active ? "none" : "transform 0.2s ease-out",
        }}
      />
    </div>
  );
}

function initGame(
  attempts: number,
  isMobile: boolean,
  playerName: string,
  isMuted: boolean,
  lives: number,
  onGameOver?: (data: { score: number; time: number; attempts: number }) => void
) {
  if (typeof window === "undefined" || !window.Phaser) {
    console.error("Phaser is not loaded yet");
    return;
  }

  // Preload audio files
  const audioFiles = {
    collect: "/sounds/collect.wav",
    hit: "/sounds/hit.wav",
    complete: "/sounds/complete.wav",
    bgm: "/sounds/bgm.mp3",
  };

  // Preload audio elements
  const audioElements: { [key: string]: HTMLAudioElement } = {};
  Object.entries(audioFiles).forEach(([key, url]) => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = "auto";
    audioElements[key] = audio;
  });

  // Define game scenes
  class BootScene extends window.Phaser.Scene {
    constructor() {
      super({ key: "BootScene" });
    }

    preload() {
      this.load.image("loading-background", "/images/bg.png");
    }

    create() {
      this.scene.start("PreloadScene");
    }
  }

  class PreloadScene extends window.Phaser.Scene {
    constructor() {
      super({ key: "PreloadScene" });
    }

    preload() {
      const bg = this.add.image(400, 300, "loading-background");
      bg.setTint(0x222222);

      const progressBar = this.add.graphics();
      const progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(240, 270, 320, 50);

      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: "Loading...",
        style: {
          font: "20px monospace",
          color: "#ffffff",
        },
      });
      loadingText.setOrigin(0.5, 0.5);

      const percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: "0%",
        style: {
          font: "18px monospace",
          color: "#ffffff",
        },
      });
      percentText.setOrigin(0.5, 0.5);

      const assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: "",
        style: {
          font: "18px monospace",
          color: "#ffffff",
        },
      });
      assetText.setOrigin(0.5, 0.5);

      this.load.on("progress", (value: number) => {
        percentText.setText(Number.parseInt(String(value * 100)) + "%");
        progressBar.clear();
        progressBar.fillStyle(0x9333ea, 1);
        progressBar.fillRect(250, 280, 300 * value, 30);
      });

      this.load.on("fileprogress", (file: { key: string }) => {
        assetText.setText("Loading asset: " + file.key);
      });

      this.load.on("complete", () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
      });

      this.loadAssets();
    }

    loadAssets() {
      Object.entries(audioFiles).forEach(([key, url]) => {
        this.load.audio(key, url);
      });

      this.createPlaceholderAssets();

      this.load.image("robot-image", "/images/robot.png");
      this.load.image("game-background", "/images/bg.png");
    }

    createPlaceholderAssets() {
      const orbCanvas = document.createElement("canvas");
      orbCanvas.width = 32;
      orbCanvas.height = 32;
      const orbCtx = orbCanvas.getContext("2d");

      if (orbCtx) {
        const gradient = orbCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.3, "#9333ea");
        gradient.addColorStop(1, "#3b82f6");

        orbCtx.fillStyle = gradient;
        orbCtx.beginPath();
        orbCtx.arc(16, 16, 15, 0, Math.PI * 2);
        orbCtx.fill();
      }

      // Create hazard
      const hazardCanvas = document.createElement("canvas");
      hazardCanvas.width = 32;
      hazardCanvas.height = 32;
      const hazardCtx = hazardCanvas.getContext("2d");

      if (hazardCtx) {
        hazardCtx.fillStyle = "#222";
        hazardCtx.beginPath();
        hazardCtx.arc(16, 16, 14, 0, Math.PI * 2);
        hazardCtx.fill();

        hazardCtx.strokeStyle = "#ff3333";
        hazardCtx.lineWidth = 2;
        hazardCtx.beginPath();

        // Draw warning symbol
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3;
          hazardCtx.moveTo(16, 16);
          hazardCtx.lineTo(
            16 + Math.cos(angle) * 12,
            16 + Math.sin(angle) * 12
          );
        }

        hazardCtx.stroke();
      }

      this.textures.addBase64("orb", orbCanvas.toDataURL());
      this.textures.addBase64("hazard", hazardCanvas.toDataURL());
    }

    create() {
      this.scene.start("GameScene");
    }
  }

  class GameScene extends window.Phaser.Scene {
    player: any;
    orbs: any;
    hazards: any;
    cursors: any;
    wasd: any;
    score: number;
    scoreText: any;
    timeText: any;
    livesText: any;
    timeLeft: number;
    gameOver: boolean;
    music: any;
    collectSound: any;
    hitSound: any;
    completeSound: any;
    timer: any;
    attempts: number | undefined;
    isHit: boolean;
    totalOrbs: number;
    orbsCollected: number;
    tileSize: number;
    isMobile: boolean;
    touchInput: { x: number; y: number };
    playerName: string;
    isMuted: boolean;
    lives: number;
    invulnerable: boolean;
    background: any;
    boostActive: boolean;
    normalSpeed: number;
    boostSpeed: number;
    aiActive: boolean;
    aiGuideTimer: any;
    aiTargetOrb: any;
    aiMessage: any;
    overdriveMessage: any;

    constructor() {
      super({ key: "GameScene" });
      this.score = 0;
      this.timeLeft = 60;
      this.gameOver = false;
      this.isHit = false;
      this.totalOrbs = 0;
      this.orbsCollected = 0;
      this.tileSize = 32;
      this.isMobile = false;
      this.touchInput = { x: 0, y: 0 };
      this.playerName = "";
      this.isMuted = false;
      this.lives = 3;
      this.invulnerable = false;
      this.boostActive = false;
      this.normalSpeed = 180;
      this.boostSpeed = 320;
      this.boostMessage = null;
      this.aiActive = false;
      this.aiGuideTimer = null;
      this.aiTargetOrb = null;
      this.aiMessage = null;
      this.overdriveMessage = null;
    }

    create() {
      this.attempts = window.game.attempts || 1;
      this.isMobile = window.game.isMobile || false;
      this.playerName = window.game.playerName || "Player";
      this.isMuted = window.game.isMuted || false;
      this.lives = window.game.lives || 3;

      const worldWidth = 1600;
      const worldHeight = 1200;
      this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

      this.background = this.add.image(
        worldWidth / 2,
        worldHeight / 2,
        "game-background"
      );
      this.background.setDisplaySize(worldWidth, worldHeight);
      this.background.setScrollFactor(1);

      this.createLevel(worldWidth, worldHeight);

      this.player = this.physics.add.sprite(
        worldWidth / 2,
        worldHeight / 2,
        "robot-image"
      );
      this.player.setCollideWorldBounds(true);
      this.player.setScale(0.07);

      const robotWidth = 80;
      const robotHeight = 80;
      this.player.body.setSize(robotWidth, robotHeight);

      // Center the collision box on the sprite
      const offsetX = (this.player.width - robotWidth) / 2;
      const offsetY = (this.player.height - robotHeight) / 2;
      this.player.body.setOffset(offsetX, offsetY);

      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

      // Set up overlaps
      this.physics.add.overlap(
        this.player,
        this.orbs,
        this.collectOrb,
        null,
        this
      );
      this.physics.add.overlap(
        this.player,
        this.hazards,
        this.hitHazard,
        null,
        this
      );

      // Set up controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(window.Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(
          window.Phaser.Input.Keyboard.KeyCodes.S
        ),
        left: this.input.keyboard.addKey(
          window.Phaser.Input.Keyboard.KeyCodes.A
        ),
        right: this.input.keyboard.addKey(
          window.Phaser.Input.Keyboard.KeyCodes.D
        ),
      };

      // Add UI
      this.scoreText = this.add
        .text(16, 16, "Score: 0", {
          fontSize: "18px",
          color: "#ffffff",
          fontFamily: "monospace",
        })
        .setScrollFactor(0);

      this.timeText = this.add
        .text(16, 40, "Time: 60", {
          fontSize: "18px",
          color: "#ffffff",
          fontFamily: "monospace",
        })
        .setScrollFactor(0);

      this.livesText = this.add
        .text(16, 64, `Lives: ${this.lives}`, {
          fontSize: "18px",
          color: "#ff5555",
          fontFamily: "monospace",
        })
        .setScrollFactor(0);

      this.add
        .text(16, 88, `Player: ${this.playerName}`, {
          fontSize: "14px",
          color: "#9333ea",
          fontFamily: "monospace",
        })
        .setScrollFactor(0);

      this.timer = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });

      this.aiEffectParticles = this.add.particles(0, 0, "orb", {
        scale: { start: 0.1, end: 0 },
        speed: 20,
        lifespan: 800,
        blendMode: "ADD",
        tint: 0x00ffff,
        on: false,
      });

      this.boostEffectParticles = this.add.particles(0, 0, "orb", {
        scale: { start: 0.2, end: 0 },
        speed: 60,
        lifespan: 800,
        blendMode: "ADD",
        tint: 0xfff200,
        on: false,
      });

      // Add sounds
      this.music = this.sound.add("bgm", { loop: true, volume: 0.3 });
      this.collectSound = this.sound.add("collect", { volume: 0.5 });
      this.hitSound = this.sound.add("hit", { volume: 0.5 });
      this.completeSound = this.sound.add("complete", { volume: 0.7 });

      this.setMuted(this.isMuted);

      if (!this.isMuted) {
        this.music.play();
      }

      this.totalOrbs = this.orbs.getChildren().length;
      this.orbsCollected = 0;

      this.dispatchEvent("scoreUpdate", { score: this.score });
      this.dispatchEvent("timeUpdate", { time: this.timeLeft });
      this.dispatchEvent("livesUpdate", { lives: this.lives });
    }

    setMuted(muted: boolean) {
      this.isMuted = muted;
      

      if (this.sound) {
        try {
          if (muted) {
            this.sound.mute = true;
            if (this.music && this.music.isPlaying) {
              this.music.pause();
            }
          } else if (!this.gameOver) {
            this.sound.mute = false;
            if (this.music && !this.music.isPlaying && !this.music.isPaused) {
              this.music.play();
            } else if (this.music && this.music.isPaused) {
              this.music.resume();
            }
          }
        } catch (e) {
          console.error("Error setting mute state:", e);
        }
      }
    }

    setBoost(active: boolean) {
      this.boostActive = active;

      this.updateOverdriveMessage();

      if (this.boostMessage) this.boostMessage.destroy();
      if (this.aiMessage) this.aiMessage.destroy();

      if (active) {
        this.boostMessage = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            "BOOST ACTIVATED",
            {
              fontSize: "24px",
              fontFamily: "monospace",
              color: "#00ffff",
              stroke: "#000000",
              strokeThickness: 4,
              align: "center",
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);

        const suggestAI = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 70,
            "Activate AI Assist to enter Overdrive Mode!",
            {
              fontSize: "16px",
              fontFamily: "monospace",
              color: "#ffffff",
              stroke: "#000000",
              strokeThickness: 3,
              align: "center",
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);

        this.tweens.add({
          targets: [this.aiMessage, suggestAI],
          alpha: 0,
          ease: "Power2",
          duration: 500,
          delay: 3000,
          onComplete: () => {
            suggestAI.destroy();
          },
        });
        this.player.setVelocity(
          this.player.body.velocity.x * this.boostSpeed,
          this.player.body.velocity.y * this.boostSpeed
        );
        this.boostEffectParticles.setPosition(this.player.x, this.player.y);
        this.boostEffectParticles.startFollow(this.player);
        this.boostEffectParticles.start();
      } else {
        this.player.setVelocity(
          this.player.body.velocity.x / this.boostSpeed,
          this.player.body.velocity.y / this.boostSpeed
        );
        this.boostEffectParticles.stopFollow();
        this.boostEffectParticles.stop();
      }
    }

    updateOverdriveMessage() {
      if (this.boostMessage) this.boostMessage.destroy();
      if (this.aiMessage) this.aiMessage.destroy();

      if (this.aiActive && this.boostActive) {
        if (!this.overdriveMessage) {
          this.overdriveMessage = this.add
            .text(
              this.cameras.main.centerX,
              this.cameras.main.centerY - 150,
              "OVERDRIVE MODE ACTIVATED!",
              {
                fontSize: "28px",
                fontFamily: "monospace",
                color: "#ffff00",
                stroke: "#000000",
                strokeThickness: 5,
                align: "center",
              }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100);

          this.tweens.add({
            targets: this.overdriveMessage,
            scale: { from: 1, to: 1.1 },
            alpha: { from: 1, to: 0.8 },
            duration: 800,
            yoyo: true,
            repeat: -1,
          });

          if (this.aiMessage && this.aiMessage.alpha > 0) {
            this.aiMessage.alpha = 0;
          }
        }
      } else if (this.overdriveMessage) {
        this.overdriveMessage.destroy();
        this.overdriveMessage = null;

        if (this.aiActive && this.aiMessage && this.aiMessage.alpha === 0) {
          this.aiMessage.alpha = 1;
        }
      }
    }

    resetGame() {
      if (this.gameOver) {
        this.scene.restart();
      } else {
        this.score = 0;
        this.timeLeft = 60;
        this.orbsCollected = 0;
        this.lives = 3;
        this.music.stop();
        this.timer.paused = false;
        this.gameOver = false;
        this.scene.restart();
      }
      this.scoreText.setText(`Score: ${this.score}`);
      this.timeText.setText(`Time: ${this.timeLeft}`);
      this.livesText.setText(`Lives: ${this.lives}`);
      this.dispatchEvent("scoreUpdate", { score: this.score });
      this.dispatchEvent("livesUpdate", { lives: this.lives });
      this.dispatchEvent("timeUpdate", { time: this.timeLeft });
      // this.music.play();
    }

    createLevel(worldWidth: number, worldHeight: number) {
      this.orbs = this.physics.add.group();
      this.hazards = this.physics.add.group();

      // Add orbs in an interesting pattern
      const orbPositions = [
        // Outer circle of orbs
        ...[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 350;
          return {
            x: worldWidth / 2 + Math.cos(angle) * radius,
            y: worldHeight / 2 + Math.sin(angle) * radius,
          };
        }),
        // Inner circle of orbs
        ...[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 200;
          return {
            x: worldWidth / 2 + Math.cos(angle) * radius,
            y: worldHeight / 2 + Math.sin(angle) * radius,
          };
        }),
        // Random orbs throughout the world
        ...[...Array(20)].map(() => ({
          x: Math.random() * (worldWidth - 100) + 50,
          y: Math.random() * (worldHeight - 100) + 50,
        })),
      ];

      // Create orbs
      orbPositions.forEach((pos) => {
        const orb = this.orbs.create(pos.x, pos.y, "orb");
        orb.setScale(0.5);
        orb.body.setCircle(10);
        orb.setOffset(6, 6);
      });

      // Add hazards throughout the world
      const hazardPositions = [
        { x: worldWidth / 2 - 200, y: worldHeight / 2 - 200, vx: 60, vy: 0 },
        { x: worldWidth / 2 + 200, y: worldHeight / 2 - 200, vx: -60, vy: 0 },
        { x: worldWidth / 2 - 200, y: worldHeight / 2 + 200, vx: 0, vy: 60 },
        { x: worldWidth / 2 + 200, y: worldHeight / 2 + 200, vx: 0, vy: -60 },
        { x: worldWidth / 2, y: worldHeight / 2 - 300, vx: 70, vy: 70 },
        { x: worldWidth / 2, y: worldHeight / 2 + 300, vx: -70, vy: -70 },
        { x: worldWidth / 2 - 300, y: worldHeight / 2, vx: -70, vy: 70 },
        { x: worldWidth / 2 + 300, y: worldHeight / 2, vx: 70, vy: -70 },
        // Add more hazards throughout the world
        ...[...Array(30)].map(() => ({
          x: Math.random() * (worldWidth - 200) + 100,
          y: Math.random() * (worldHeight - 200) + 100,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
        })),
      ];

      hazardPositions.forEach((pos) => {
        const hazard = this.hazards.create(pos.x, pos.y, "hazard");
        hazard.setVelocity(pos.vx, pos.vy);
        hazard.setBounce(1, 1);
        hazard.setCollideWorldBounds(true);
      });
    }

    collectOrb(player: any, orb: any) {
      orb.disableBody(true, true);
      this.collectSound.play();

      this.score += 100;
      this.scoreText.setText(`Score: ${this.score}`);
      this.dispatchEvent("scoreUpdate", { score: this.score });

      this.orbsCollected++;

      if (this.aiActive) {
        this.aiTargetOrb = this.findNearestOrb();
      }

      if (this.orbsCollected >= this.totalOrbs) {
        this.completeLevel();
      }
    }

    hitHazard(player: any, hazard: any) {
      if (this.isHit || this.invulnerable || this.gameOver) return;

      this.isHit = true;
      this.invulnerable = true;

      if (!this.isMuted) {
        this.hitSound.play();
      }

      this.score = Math.max(0, this.score - 50);
      this.scoreText.setText(`Score: ${this.score}`);
      this.dispatchEvent("scoreUpdate", { score: this.score });

      this.lives--;
      this.livesText.setText(`Lives: ${this.lives}`);
      this.dispatchEvent("livesUpdate", { lives: this.lives });

      if (this.lives <= 0) {
        this.time.delayedCall(600, () => {
          this.endGame();
        });
      }

      // Flash the player
      this.tweens.add({
        targets: player,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.isHit = false;

          // Add brief invulnerability period after hit
          this.time.delayedCall(1000, () => {
            this.invulnerable = false;
          });
        },
      });
    }

    updateTimer() {
      if (this.gameOver) return;

      this.timeLeft--;
      this.timeText.setText(`Time: ${this.timeLeft}`);
      this.dispatchEvent("timeUpdate", { time: this.timeLeft });

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }

    completeLevel() {
      if (this.gameOver) return;

      this.gameOver = true;

      if (!this.isMuted) {
        this.completeSound.play();
        this.music.stop();
      }

      const timeBonus = this.timeLeft * 10;
      this.score += timeBonus;
      this.scoreText.setText(`Score: ${this.score}`);

      const completionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        "LEVEL COMPLETE!",
        {
          fontSize: "32px",
          color: "#ffffff",
          fontFamily: "monospace",
          fontStyle: "bold",
        }
      );
      completionText.setOrigin(0.5);

      const bonusText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        `Time Bonus: ${timeBonus}`,
        {
          fontSize: "24px",
          color: "#9333ea",
          fontFamily: "monospace",
        }
      );
      bonusText.setOrigin(0.5);

      const finalScoreText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 40,
        `Final Score: ${this.score}`,
        {
          fontSize: "28px",
          color: "#3b82f6",
          fontFamily: "monospace",
          fontStyle: "bold",
        }
      );
      finalScoreText.setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        this.endGame();
      });

      setTimeout(() => {
        this.dispatchEvent("gameOver", {
          score: this.score,
          time: 60 - this.timeLeft,
          attempts: this.attempts,
        });
      }, 500);
    }

    endGame() {
      if (this.gameOver) return;

      this.gameOver = true;

      if (this.music) {
        try {
          this.music.stop();
        } catch (e) {
          console.error("Error stopping music:", e);
        }
      }

      if (typeof onGameOver === "function") {
        onGameOver({
          score: this.score,
          time: 60 - this.timeLeft,
          attempts: this.attempts || 1,
        });
      }

      this.dispatchEvent("gameOver", {
        score: this.score,
        time: 60 - this.timeLeft,
        attempts: this.attempts,
      });

      this.timer.remove();

      this.scene.pause();
    }

    dispatchEvent(type: string, data: any) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("game-event", {
            detail: { type, data },
          })
        );
      }
    }

    setTouchInput(x: number, y: number) {
      this.touchInput = { x, y };
    }

    setAIAssistant(active: boolean) {
      this.aiActive = active;

      this.updateOverdriveMessage();

      if (active) {
        this.invulnerable = true;

        this.aiEffectParticles.setPosition(this.player.x, this.player.y);
        this.aiEffectParticles.startFollow(this.player);
        this.aiEffectParticles.start();

        if (this.aiMessage) this.aiMessage.destroy();
        if (this.boostMessage) this.boostMessage.destroy();

        this.aiMessage = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            "AI ASSISTANT ACTIVATED",
            {
              fontSize: "24px",
              fontFamily: "monospace",
              color: "#00ffff",
              stroke: "#000000",
              strokeThickness: 4,
              align: "center",
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);

        const suggestBoost = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 70,
            "Activate Boost to enter Overdrive Mode!",
            {
              fontSize: "16px",
              fontFamily: "monospace",
              color: "#ffffff",
              stroke: "#000000",
              strokeThickness: 3,
              align: "center",
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(100);

        this.tweens.add({
          targets: [this.aiMessage, suggestBoost],
          alpha: 0,
          ease: "Power2",
          duration: 500,
          delay: 3000,
          onComplete: () => {
            suggestBoost.destroy();
          },
        });

        const shieldEffect = this.add.circle(
          this.player.x,
          this.player.y,
          45,
          0x00ffff,
          0.2
        );
        shieldEffect.setDepth(-1);
        this.tweens.add({
          targets: shieldEffect,
          alpha: { from: 0.2, to: 0.4 },
          scale: { from: 1, to: 1.2 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });

        this.time.addEvent({
          delay: 16,
          callback: () => {
            if (this.aiActive && shieldEffect) {
              shieldEffect.setPosition(this.player.x, this.player.y);
            } else if (shieldEffect) {
              shieldEffect.destroy();
            }
          },
          callbackScope: this,
          loop: true,
        });

        this.aiTargetOrb = this.findNearestOrb();

        // Set up a timer to periodically update the target orb
        this.aiGuideTimer = this.time.addEvent({
          delay: 300,
          callback: () => {
            this.aiTargetOrb = this.findNearestOrb();
          },
          callbackScope: this,
          loop: true,
        });
      } else {
        this.invulnerable = false;

        if (this.aiMessage) {
          this.aiMessage.destroy();
          this.aiMessage = null;
        }

        if (this.overdriveMessage) {
          this.overdriveMessage.destroy();
          this.overdriveMessage = null;
        }

        this.aiEffectParticles.stopFollow();
        this.aiEffectParticles.stop();

        if (this.aiGuideTimer) {
          this.aiGuideTimer.remove();
          this.aiGuideTimer = null;
        }
        this.aiTargetOrb = null;
      }
    }

    findNearestOrb() {
      if (!this.orbs || this.orbs.getChildren().length === 0) return null;

      const orbs = this.orbs.getChildren();
      let nearestOrb = null;
      let shortestDistance = Infinity;

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        if (orb.body && orb.body.enable) {
          const distance = window.Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            orb.x,
            orb.y
          );

          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestOrb = orb;
          }
        }
      }

      // If no nearby orbs, pick a random enabled orb
      if (!nearestOrb) {
        const enabledOrbs = orbs.filter(
          (orb: any) => orb.body && orb.body.enable
        );
        if (enabledOrbs.length > 0) {
          nearestOrb =
            enabledOrbs[Math.floor(Math.random() * enabledOrbs.length)];
        }
      }

      return nearestOrb;
    }

    update() {
      if (this.gameOver || this.isHit) return;

      const speed = this.boostActive ? this.boostSpeed : this.normalSpeed;
      let moving = false;

      this.player.setVelocity(0);

      if (this.aiActive) {
        let targetX = this.player.x;
        let targetY = this.player.y;

        if (
          this.aiTargetOrb &&
          this.aiTargetOrb.body &&
          this.aiTargetOrb.body.enable
        ) {
          targetX = this.aiTargetOrb.x;
          targetY = this.aiTargetOrb.y;
        } else {
          // Generate a target point in the direction we're facing
          const angle = Math.random() * Math.PI * 2;
          targetX = this.player.x + Math.cos(angle) * 200;
          targetY = this.player.y + Math.sin(angle) * 200;

          // Keep the target within world bounds
          targetX = Math.max(
            50,
            Math.min(this.physics.world.bounds.width - 50, targetX)
          );
          targetY = Math.max(
            50,
            Math.min(this.physics.world.bounds.height - 50, targetY)
          );

          // Try to find a new orb every few frames
          if (Math.random() < 0.05) {
            this.aiTargetOrb = this.findNearestOrb();
          }
        }

        // Calculate direction to target
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize and apply movement if  not right on top of the target
        if (distance > 10) {
          const normalizedX = dx / distance;
          const normalizedY = dy / distance;

          const aiSpeed = speed * 1.2;

          this.player.setVelocityX(normalizedX * aiSpeed);
          this.player.setVelocityY(normalizedY * aiSpeed);

          if (normalizedX < 0) {
            this.player.flipX = true;
          } else if (normalizedX > 0) {
            this.player.flipX = false;
          }

          moving = true;
        }
      } else {
        // Regular movement controls
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
          this.player.setVelocityX(-speed);
          this.player.flipX = true;
          moving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
          this.player.setVelocityX(speed);
          this.player.flipX = false;
          moving = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
          this.player.setVelocityY(-speed);
          moving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
          this.player.setVelocityY(speed);
          moving = true;
        }

        if (this.touchInput.x !== 0 || this.touchInput.y !== 0) {
          // Calculate the magnitude of the touch input
          const magnitude = Math.sqrt(
            this.touchInput.x * this.touchInput.x +
              this.touchInput.y * this.touchInput.y
          );

          if (magnitude > 0.1) {
            const normalizedX = this.touchInput.x / magnitude;
            const normalizedY = this.touchInput.y / magnitude;

            this.player.setVelocityX(normalizedX * speed);
            this.player.setVelocityY(normalizedY * speed);

            if (this.touchInput.x < 0) {
              this.player.flipX = true;
            } else if (this.touchInput.x > 0) {
              this.player.flipX = false;
            }

            moving = true;
          }
        }
      }

      // Add a subtle bobbing effect when moving
      if (moving) {
        this.player.y += Math.sin(this.time.now / 100) * 0.5;
      }

      // Add AI particle effect
      if (this.aiActive && moving && Math.random() > 0.7) {
        const aiParticle = this.add
          .circle(this.player.x, this.player.y + 20, 5, 0x00ffff, 0.7)
          .setDepth(0);
        this.time.delayedCall(300, () => {
          aiParticle.destroy();
        });
      }

      // Add boost particle effect
      if (this.boostActive && moving && Math.random() > 0.7) {
        const boostParticle = this.add
          .circle(this.player.x, this.player.y + 20, 5, 0xffff00, 0.7)
          .setDepth(0);
        this.time.delayedCall(300, () => {
          boostParticle.destroy();
        });
      }

      // Rotate hazards for visual effect
      this.hazards.getChildren().forEach((hazard: { angle: number }) => {
        hazard.angle += 1;
      });

      // Make orbs pulse
      this.orbs
        .getChildren()
        .forEach((orb: { alpha: number; scale: number }) => {
          orb.alpha = 0.7 + Math.sin(this.time.now / 200) * 0.3;
          orb.scale = 0.9 + Math.sin(this.time.now / 400) * 0.1;
        });
    }
  }

  // Define game configuration
  const config = {
    type: window.Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: 600,
    scale: {
      mode: window.Phaser.Scale.FIT,
      autoCenter: window.Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, GameScene],
    pixelArt: true,
    audio: {
      disableWebAudio: false,
    },
  };

  if (window.game) {
    try {
      if (window.game.sound && window.game.sound.sounds) {
        window.game.sound.sounds.forEach((sound: { isPlaying: boolean; stop: () => void }) => {
          if (sound.isPlaying) {
            sound.stop();
          }
        });
      }
      window.game.destroy(true);
      window.game = null;
    } catch (e) {
      console.error("Error destroying previous game:", e);
    }
  }

  window.game = new window.Phaser.Game(config);
  window.game.attempts = attempts;
  window.game.isMobile = isMobile;
  window.game.playerName = playerName;
  window.game.isMuted = isMuted;
  window.game.lives = lives;
}

declare global {
  interface Window {
    game: any;
    Phaser: any;
  }
}
