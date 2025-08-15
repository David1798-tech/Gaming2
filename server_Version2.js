// server.js - Backend API Server for Gaming Website

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (replace with database in production)
let gameData = {
  players: [],
  leaderboard: [
    { name: 'Player1', score: 15420, game: 'snake' },
    { name: 'GameMaster', score: 12880, game: 'shooter' },
    { name: 'ProGamer', score: 11340, game: 'snake' },
    { name: 'SnakeKing', score: 9750, game: 'snake' },
    { name: 'Sharpshooter', score: 8290, game: 'shooter' }
  ],
  gameStats: {
    totalPlayers: 1250,
    gamesPlayed: 5430,
    topScore: 15420
  }
};

// API Routes

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const sortedLeaderboard = gameData.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json({
      success: true,
      data: sortedLeaderboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// Submit score
app.post('/api/score', (req, res) => {
  try {
    const { playerName, score, game } = req.body;
    // Validate input
    if (!playerName || typeof score !== 'number' || !game) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }
    // Add to leaderboard
    const newEntry = {
      name: playerName.substring(0, 20), // Limit name length
      score,
      game
    };
    gameData.leaderboard.push(newEntry);

    // Update game stats
    gameData.gameStats.totalPlayers = Math.max(gameData.gameStats.totalPlayers, gameData.leaderboard.length);
    gameData.gameStats.gamesPlayed += 1;
    gameData.gameStats.topScore = Math.max(gameData.gameStats.topScore, score);

    res.json({ success: true, message: 'Score submitted successfully!', data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit score' });
  }
});

// Get game stats
app.get('/api/stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: gameData.gameStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch game stats' });
  }
});

// Add player
app.post('/api/player', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid player name' });
    }
    const newPlayer = {
      id: Date.now(),
      name: name.substring(0, 20)
    };
    gameData.players.push(newPlayer);
    res.json({ success: true, message: 'Player added!', data: newPlayer });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add player' });
  }
});

// Get all players
app.get('/api/players', (req, res) => {
  try {
    res.json({ success: true, data: gameData.players });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

// Static file serving for SPA (Single Page Application)
app.get('*', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'index.html');
    const html = await fs.readFile(filePath, 'utf8');
    res.send(html);
  } catch (error) {
    res.status(500).send('Error loading the main page.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});