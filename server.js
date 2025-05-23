const express = require('express');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static('.'));

// Endpoint to fetch Akatsuki user profile data
app.get('/api/user', async (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const response = await fetch(`https://akatsuki.gg/api/v1/users/full?id=${userId}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Endpoint to run Python script and return ranked scores
app.get('/api/fetch-scores', (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const pythonCommand = `python fetch_ranked_scores.py ${userId}`;
  console.log(`Running: ${pythonCommand}`);

  exec(pythonCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Python error: ${stderr}`);
      return res.status(500).json({ error: 'Failed to fetch ranked scores' });
    }

    const filePath = path.join(__dirname, `${userId}_scores.txt`);
    res.sendFile(filePath);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
