require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('Facade bot server is running');
});

app.post('/analyze-drawing', async (req, res) => {
  try {
    const { drawingText, wallName } = req.body;

    if (!drawingText) {
      return res.status(400).json({
        ok: false,
        error: 'drawingText is required'
      });
    }

    return res.json({
      ok: true,
      wallName: wallName || 'wall',
      message: 'Drawing received successfully',
      received: drawingText
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});