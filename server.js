require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('Facade bot server is running');
});

app.post('/analyze-drawing', async (req, res) => {
  try {
    const { imageUrl, wallName } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        ok: false,
        error: 'imageUrl is required'
      });
    }

    console.log('IMAGE URL:', imageUrl);

    return res.json({
      ok: true,
      wallName: wallName || 'wall',
      imageUrl,
      message: 'Картинка получена сервером'
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
