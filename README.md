# RoboRush

<div align="center">
    <img src="https://roborush-ashen.vercel.app/public/images/icon-512.png" alt="RoboRush Logo" width="100"/>>
</div>

RoboRush is an engaging browser-based arcade game where players control a robot to collect energy orbs while avoiding hazards in a race against time. The game features offline play capabilities, AI assistance, and global leaderboards.

## Table of Contents

- [RoboRush](#roborush)
  - [Table of Contents](#table-of-contents)
  - [🚀 Features](#-features)
  - [📱 Screenshots](#-screenshots)
  - [🎮 How to Play](#-how-to-play)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [⚙️ Installation and Setup](#️-installation-and-setup)
    - [Prerequisites](#prerequisites)
    - [Development Setup](#development-setup)
    - [Building for Production](#building-for-production)
  - [🌐 Offline Support](#-offline-support)
  - [📁 Project Structure](#-project-structure)
  - [🎯 Future Enhancements](#-future-enhancements)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [👏 Credits](#-credits)

## 🚀 Features

- **Engaging Gameplay**: Navigate your robot through mazes, collect energy orbs, and avoid hazards
- **Progressive Web App**: Install on your device and play offline
- **AI Assistant**: Get help from an AI assistant that automatically navigates the robot
- **Speed Boost**: Activate speed boost to move faster through the maze
- **Leaderboards**: Compete with players worldwide for the highest score
- **Offline Support**: Play anytime, even without an internet connection
- **Cross-platform**: Works on desktop and mobile devices
- **Sync Across Devices**: Save your progress and scores across devices with your name
- **Responsive Controls**: Keyboard controls (WASD/Arrow keys) on desktop, virtual joystick on mobile

## 📱 Screenshots

![Gameplay Screenshot](https://roborush-ashen.vercel.app/public/images/gameplay.gif)

## 🎮 How to Play

1. **Movement**:

   - Desktop: Use WASD or Arrow keys
   - Mobile: Use the virtual joystick

2. **Objective**:

   - Collect all energy orbs (+100 points each)
   - Avoid rotating hazards (lose 50 points and 1 life)
   - Complete the level before time runs out

3. **Special Abilities**:

   - **Speed Boost**: Temporarily increases movement speed
   - **AI Assistant**: Automatically navigates to collect orbs
   - **Overdrive Mode**: Activate both Speed Boost and AI Assistant together

4. **Scoring**:
   - +100 points per orb
   - +10 points per second remaining (time bonus)
   - -50 points when hit by a hazard

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Game Engine**: Phaser.js
- **Database**: MySQL
- **ORM**: MappifySQL
- **PWA Support**: Service Workers for offline play

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Development Setup

1. Clone the repository

   ```bash
   git clone https://github.com/walidadebayo/roborush.git
   cd roborush
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables & run the schema.sql file

   - Run the `schema.sql` file located in the `db/` directory to set up the necessary tables.
   - Create a `.env` file with your MySQL credentials:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=roborush_db
   DB_PORT=3306
   ```

4. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🌐 Offline Support

RoboRush is a Progressive Web App (PWA) that works offline:

- Game assets and sounds are cached for offline use
- Scores are saved locally when offline and synced when back online
- Install to your device for app-like experience

## 📁 Project Structure

```
roborush/
├── app/                  # Next.js app directory
│   ├── api/              # API routes for backend functionality
│   ├── leaderboard/      # Leaderboard page
│   ├── play/             # Main game page
│   ├── layout.tsx         # Layout component for the app
│   ├── page.tsx          # Main entry point for the app
│   └── manifest.json     # PWA manifest
├── components/           # React components
│   ├── game-engine.tsx   # Phaser game integration
│   ├── score-modal.tsx   # Score submission modal
│   ├── player-name-modal.tsx # Player name input modal
│   └── More components... # Other reusable components
├── public/               # Static assets
│   ├── images/           # Game images and icons
│   ├── sounds/           # Game audio files
│   └── sw.js             # Service worker for offline support
└── README.md             # This file
```

## 🎯 Future Enhancements

- Additional game levels with increasing difficulty
- Power-ups and special abilities
- Multiplayer mode
- Achievement system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Credits

- Game Engine: [Phaser.js](https://phaser.io/)
- UI Framework: [Next.js](https://nextjs.org/)
- Database: [MySQL](https://www.mysql.com/)
- ORM: [MappifySQL](https://github.com/walidadebayo/mappifysql)
- Sound Effects: [Free Sound Effects](https://freesound.org/)
- Icons: [Lucide Icons](https://lucide.dev/)

---

Built with ❤️ by [Walid Adebayo](https:///walidadebayo.netlify.app) and the open-source community.

```
To host your own instance of RoboRush, simply deploy the Next.js application to platforms like Vercel, Netlify, or any Node.js hosting service. For advanced deployments (self-managed hosting), you can also package it into a Docker container and deploy on Alibaba Cloud ECS. Make sure to set up the MySQL database and configure the environment variables accordingly.
```
