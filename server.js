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

    const text = drawingText.toLowerCase();

    const numbers = text.match(/\d+(\.\d+)?/g);

    let width = null;
    let height = null;

    if (numbers && numbers.length >= 2) {
      width = parseFloat(numbers[0]);
      height = parseFloat(numbers[1]);
    }

    if (!width || !height) {
      return res.json({
        ok: false,
        message: 'Не хватает данных',
        missing: {
          width: !width,
          height: !height
        },
        hint: 'Укажи ширину и высоту, например: ширина 10м высота 3м'
      });
    }

    const area = width * height;

    return res.json({
      ok: true,
      wallName: wallName || 'wall',
      width,
      height,
      area,
      message: `Площадь стены: ${area} м2`
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
