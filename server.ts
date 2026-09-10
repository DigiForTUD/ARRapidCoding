import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Habitat detection schema (Lake & Forest wildlife)
const habitatDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    hasLake: {
      type: Type.BOOLEAN,
      description: 'True if a lake, pond, river, or water body is visible and suitable for swimming ducks',
    },
    hasForest: {
      type: Type.BOOLEAN,
      description: 'True if a forest, woods, pine/deciduous trees, grove, or woodland clearing is visible and suitable for Elks and Roe Deer',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence score from 0.0 to 1.0',
    },
    waterType: {
      type: Type.STRING,
      description: 'Categorization: lake, pond, river, reservoir, pool, or none',
    },
    forestType: {
      type: Type.STRING,
      description: 'Categorization: pine_taiga, mixed_woodland, beech_woods, forest_clearing, parkland_trees, or none',
    },
    description: {
      type: Type.STRING,
      description: 'Concise summary of the habitat (water, trees, landscape, lighting)',
    },
    waterRegion: {
      type: Type.OBJECT,
      description: 'Normalized bounding box [0-1000] of the water body in the image',
      properties: {
        ymin: { type: Type.INTEGER },
        xmin: { type: Type.INTEGER },
        ymax: { type: Type.INTEGER },
        xmax: { type: Type.INTEGER },
      },
      required: ['ymin', 'xmin', 'ymax', 'xmax'],
    },
    recommendedSwimArea: {
      type: Type.OBJECT,
      description: 'Inner safe swimming zone [0-1000] where ducks can swim smoothly',
      properties: {
        ymin: { type: Type.INTEGER },
        xmin: { type: Type.INTEGER },
        ymax: { type: Type.INTEGER },
        xmax: { type: Type.INTEGER },
      },
      required: ['ymin', 'xmin', 'ymax', 'xmax'],
    },
    forestRegion: {
      type: Type.OBJECT,
      description: 'Normalized bounding box [0-1000] of the forest / tree canopy / clearing',
      properties: {
        ymin: { type: Type.INTEGER },
        xmin: { type: Type.INTEGER },
        ymax: { type: Type.INTEGER },
        xmax: { type: Type.INTEGER },
      },
      required: ['ymin', 'xmin', 'ymax', 'xmax'],
    },
    recommendedForestGroundArea: {
      type: Type.OBJECT,
      description: 'Safe ground walking/grazing area [0-1000] where Elks and Roe Deer can walk and graze',
      properties: {
        ymin: { type: Type.INTEGER },
        xmin: { type: Type.INTEGER },
        ymax: { type: Type.INTEGER },
        xmax: { type: Type.INTEGER },
      },
      required: ['ymin', 'xmin', 'ymax', 'xmax'],
    },
    waterCalmness: {
      type: Type.STRING,
      description: 'Surface texture: calm, gentle_ripples, or choppy',
    },
    lighting: {
      type: Type.STRING,
      description: 'Environmental lighting: bright_sun, overcast, golden_hour, dim, or indoor',
    },
    pochardPlacement: {
      type: Type.OBJECT,
      description: 'Initial coordinate and scale recommendation for the primary duck',
      properties: {
        x: { type: Type.INTEGER, description: 'Initial X coordinate (0-1000)' },
        y: { type: Type.INTEGER, description: 'Initial Y coordinate (0-1000)' },
        scale: { type: Type.NUMBER, description: 'Relative scale from 0.4 to 1.5 based on distance/perspective' },
      },
      required: ['x', 'y', 'scale'],
    },
  },
  required: [
    'hasLake',
    'hasForest',
    'confidence',
    'waterType',
    'forestType',
    'description',
    'waterRegion',
    'recommendedSwimArea',
    'forestRegion',
    'recommendedForestGroundArea',
    'waterCalmness',
    'lighting',
    'pochardPlacement',
  ],
};

// API Route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// API Route: Detect lake in camera frame
app.post('/api/detect-lake', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 payload' });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    if (!process.env.GEMINI_API_KEY) {
      // Graceful simulated heuristic response when key is pending
      res.json({
        hasLake: true,
        hasForest: true,
        confidence: 0.9,
        waterType: 'lake',
        forestType: 'mixed_woodland',
        description: 'Tranquil wilderness with open lake in foreground and pine/deciduous woodland along the shoreline',
        waterRegion: { ymin: 440, xmin: 40, ymax: 960, xmax: 960 },
        recommendedSwimArea: { ymin: 520, xmin: 100, ymax: 920, xmax: 900 },
        forestRegion: { ymin: 120, xmin: 30, ymax: 520, xmax: 970 },
        recommendedForestGroundArea: { ymin: 340, xmin: 80, ymax: 520, xmax: 920 },
        waterCalmness: 'gentle_ripples',
        lighting: 'bright_sun',
        pochardPlacement: { x: 500, y: 700, scale: 1.0 },
      });
      return;
    }

    const ai = getGenAI();

    const prompt = `Analyze this camera view for an Augmented Reality (AR) wildlife application.
Goal:
1. Detect if there is an open body of water (lake, pond, reservoir, river, or water surface) where waterbirds and ducks (Mallard, Mandarin Duck, Common Pochard, Eurasian Teal, Tufted Duck) can swim.
   - If water is visible, set hasLake=true and provide waterRegion [0-1000] and recommended safe swim area [0-1000].
2. Detect if there is a forest, woods, pine/deciduous trees, grove, foliage, or woodland clearing where European Elks (Moose) and Roe Deer can browse and graze.
   - If forest/trees are visible, set hasForest=true and provide forestRegion [0-1000] and recommendedForestGroundArea [0-1000] where deer and elks can walk and stand.
3. Note: The scene can have BOTH water and forest (e.g. a lake surrounded by woods), or just water, or just forest, or neither (indoor, desktop, wall). Set hasLake and hasForest accurately with high fidelity.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: habitatDetectionSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini');
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error('Error detecting lake:', error);
    res.status(500).json({
      error: 'Failed to analyze frame for lake detection',
      message: error?.message || 'Internal server error',
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
