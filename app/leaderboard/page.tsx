"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type LeaderboardEntry = {
  id: number
  name: string
  score: number
  time: number
  attempts: number
  updated_at: string
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/leaderboard")

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data")
      }

      const data = await response.json()
      setLeaderboard(data)
      setLoading(false)
    } catch {
      setError("Failed to fetch leaderboard data. Please try again.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col items-center my-20">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            LEADERBOARD
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="border-purple-500 text-purple-400 hover:bg-purple-950 hover:text-purple-300"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-4">{error}</div>}

        <div className="bg-gray-800/50 rounded-xl border border-purple-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/80 border-b border-purple-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Loading leaderboard data...
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No scores recorded yet. Be the first to play!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => (
                    <tr
                      key={index}
                      className={`
                        ${index < 3 ? "bg-gray-800/30" : "hover:bg-gray-800/20"} 
                        transition-colors
                      `}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                          ${
                            index === 0
                              ? "bg-yellow-500/20 text-yellow-300"
                              : index === 1
                                ? "bg-gray-400/20 text-gray-300"
                                : index === 2
                                  ? "bg-amber-700/20 text-amber-600"
                                  : "bg-gray-700/20 text-gray-400"
                          }
                        `}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className={`font-medium ${
                            index === 0
                              ? "text-yellow-300"
                              : index === 1
                                ? "text-gray-300"
                                : index === 2
                                  ? "text-amber-600"
                                  : "text-gray-200"
                          }`}
                        >
                          {entry.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap font-mono text-blue-400 font-bold">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap font-mono text-purple-400">
                        {formatTime(entry.time)}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap font-mono text-cyan-400">
                        {entry.attempts}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap text-gray-400 text-sm">
                        {formatDate(entry.updated_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
