const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API for Whale Report Data
app.get('/whalereport.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'whalereport.json'));
});

// API for Top Transfer Data
app.get('/toptransfer.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'toptransfer.json'));
});

// API for Greed/Fear Index
app.get('/greed_fear_index', (req, res) => {
    // This is a placeholder. You can replace it with actual logic to fetch the Greed/Fear index.
  // Example: Get Greed/Fear index from external API or database
  const greedFearData = {
    value: 50, // Example value
    timestamp: new Date().toISOString(),
    description: 'Neutral', // Example description
    // You can add more fields as needed
    // For example, you can add a classification based on the value
    classification: value < 20 ? 'Extreme Fear' : value < 40 ? 'Fear' : value < 60 ? 'Neutral' : value < 80 ? 'Greed' : 'Extreme Greed'

    

  };
  res.json(greedFearData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
