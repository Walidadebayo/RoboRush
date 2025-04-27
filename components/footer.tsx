"use client"

import Link from "next/link"
import { BotIcon as RobotIcon, Github, Twitter, Mail, ExternalLink } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900/80 backdrop-blur-md border-t border-purple-900/30 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RobotIcon className="h-8 w-8 text-purple-500" />
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                RoboRush
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              An exciting robot-themed browser game where strategy meets action in a futuristic arena.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-purple-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/play" className="text-gray-400 hover:text-purple-300 transition text-sm">
                  Play Game
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-purple-300 transition text-sm">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect section */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-purple-300">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="https://github.com/walidadebayo" target="_blank" className="text-gray-400 hover:text-purple-300 transition">
                <Github size={20} />
              </Link>
              <Link href="https://x.com/walidadebayo" target="_blank" className="text-gray-400 hover:text-purple-300 transition">
                <Twitter size={20} />
              </Link>
              <Link href="mailto:adebayowalid@gmail.com" target="_blank" className="text-gray-400 hover:text-purple-300 transition">
                <Mail size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} RoboRush. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link 
              href="https://walidadebayo.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 text-sm text-gray-400 hover:text-purple-300 transition"
            >
              <span>Created by Walid Adebayo</span>
              <ExternalLink size={14} className="opacity-70 group-hover:opacity-100 transition" />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-8 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full opacity-50"></div>
      </div>
    </footer>
  )
}
