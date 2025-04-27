import Link from "next/link"
import { Button } from "@/components/ui/button"
import  RobotIllustration from "@/components/RobotIllustration"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 max-w-4xl">

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400">
          ROBORUSH
        </h1>

        <RobotIllustration />

        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Navigate your robot through challenging obstacles, collect power-ups, and race against time in this fast-paced
          sci-fi adventure!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/play">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_rgba(124,58,237,0.7)] transition-all duration-300"
            >
              START GAME
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-purple-500 text-purple-400 hover:bg-purple-950 hover:text-purple-300"
            >
              LEADERBOARD
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">HOW TO PLAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-900/50 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">NAVIGATE</h3>
            <p className="text-gray-300">Use arrow keys or WASD on desktop, or the virtual joystick on mobile to control your robot.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-900/50 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">COLLECT</h3>
            <p className="text-gray-300">Gather energy orbs for 100 points each. Collect all orbs to complete the level and earn time bonuses.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-900/50 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">SURVIVE</h3>
            <p className="text-gray-300">Avoid rotating hazards that reduce your lives and score. Complete the level before time runs out or you lose all 3 lives. Earn up to +200 points as a time bonus.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
