"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RocketIcon } from "lucide-react";

interface PlayerNameModalProps {
  onSubmit: (name: string) => void;
  isOpen: boolean;
}

export default function PlayerNameModal({
  onSubmit,
  isOpen,
}: PlayerNameModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("roborush-player-name");
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!navigator.onLine) {
      localStorage.setItem("roborush-player-name", name);
      setError("You are offline. Your name has been saved locally.");
      onSubmit(name);
      return;
    }
    setIsSubmitting(true);
    fetch("/api/submit-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, score: 0, time: 0, attempts: 1, new: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to submit name");
        }
        return response.json();
      })
      .then(() => {
        localStorage.setItem("roborush-player-name", name);
        onSubmit(name);
        setIsSubmitting(false);
      })
      .catch(() => {
        setError(
          "Failed to submit name. Please try again or use another name."
        );
        setIsSubmitting(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-800 rounded-xl border border-purple-900/50 shadow-[0_0_30px_rgba(124,58,237,0.3)] max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center">
                <RocketIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome to RoboRush!
            </h2>
            <p className="text-gray-400">Enter your name to start playing</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="player-name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Your Name
              </label>
              <Input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gray-900 border-gray-700 text-white"
                maxLength={20}
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? "Submitting..." : "Start Game"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
