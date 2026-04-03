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

    const prompt = `
Ты анализируешь изображение, которое прислал клиент.

Твоя задача:
1. Определи, является ли изображение чертежом/схемой стены дома.
2. Если это не чертёж, напиши, что нужно прислать именно чертёж стены с размерами.
3. Если это чертёж, проверь, хватает ли данных для расчёта площади стены БЕЗ учёта окон и дверей.
4. Если данных не хватает, укажи, каких именно размеров не хватает.
5. Если данных хватает, рассчитай площадь стены без учёта окон и дверей.
6. Ответ верни строго в JSON.

Правила:
- Если на изображении просто фото дома, это НЕ чертёж.
- Не выдумывай размеры.
- Если размеры читаются неуверенно, считай, что данных недостаточно.
- Если площадь посчитать нельзя, не считай её.

Формат ответа строго такой:
{
  "isDrawing": true,
  "hasEnoughData": true,
  "width": 10,
  "height": 3,
  "area": 30,
  "missing": [],
  "message": "Площадь стены: 30 м2"
}
`;

    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: prompt
              },
              {
                type: 'input_image',
                image_url: imageUrl
              }
            ]
          }
        ]
      })
    });

    const data = await openaiResponse.json();

    let rawText = '';

    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part.type === 'output_text' && part.text) {
              rawText += part.text;
            }
          }
        }
      }
    }

    if (!rawText) {
      return res.status(500).json({
        ok: false,
        message: 'OpenAI не вернул текстовый ответ',
        raw: data
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        message: 'Не удалось распарсить JSON от OpenAI',
        rawText
      });
    }

    return res.json({
      ok: true,
      wallName: wallName || 'wall',
      isDrawing: parsed.isDrawing ?? false,
      hasEnoughData: parsed.hasEnoughData ?? false,
      width: parsed.width ?? null,
      height: parsed.height ?? null,
      area: parsed.area ?? null,
      missing: parsed.missing ?? [],
      message: parsed.message || 'Ответ получен'
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
