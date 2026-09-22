import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client getter
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Armenia EduOS National Infrastructure',
    timestamp: new Date().toISOString(),
    aiProviders: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      firebird: !!process.env.FIREBIRD_API_KEY || !!process.env.FIREBIRD_BASE_URL,
    }
  });
});

// Helper to query OpenAI or Firebird/Custom OpenAI-compatible API
async function queryOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature = 0.7
): Promise<string> {
  const url = endpoint.endsWith('/chat/completions')
    ? endpoint
    : `${endpoint.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI Provider API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Unified AI Dispatcher route for lesson planning, grading insights, and parent letters
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const {
      task, // 'lesson_plan' | 'parent_message' | 'grade_analysis' | 'test_connection'
      provider = 'gemini', // 'gemini' | 'openai' | 'firebird' | 'custom'
      customApiKey,
      customBaseUrl,
      customModel,
      prompt,
      systemInstruction,
      params,
    } = req.body;

    const armenianSystemContext = `Դուք Հայաստանի Հանրապետության Կրթության, գիտության, մշակույթի և սպորտի նախարարության (ՀՀ ԿԳՄՍՆ) հանրակրթական համակարգի առաջատար մեթոդիստ-խորհրդատու եք: 
Ձեր խնդիրն է աջակցել հայ ուսուցիչներին՝ ապահովելով Հանրակրթության պետական չափորոշչի (ՀՊՉ) պահանջները, 10-բալանոց գնահատման չափանիշները, ԽԻԿ (Խթանում, Իմաստի ընկալում, Կշռադատում) մեթոդաբանությունը և բարեկիրթ մանկավարժական հաղորդակցությունը: 
${systemInstruction || ''}`;

    let resultText = '';

    // Route according to selected AI Provider
    if (provider === 'openai') {
      const apiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        // Fallback to Gemini if OpenAI key isn't provided
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `${armenianSystemContext}\n\n[OpenAI key was not configured in environment, fulfilling via built-in Gemini engine]\n\n${prompt}`,
          });
          resultText = response.text || '';
        } catch {
          return res.status(400).json({
            error: 'OpenAI API key is required. Please set OPENAI_API_KEY in settings or configure in AI settings modal.',
          });
        }
      } else {
        resultText = await queryOpenAICompatible(
          'https://api.openai.com/v1',
          apiKey,
          customModel || 'gpt-4o-mini',
          [
            { role: 'system', content: armenianSystemContext },
            { role: 'user', content: prompt },
          ]
        );
      }
    } else if (provider === 'firebird' || provider === 'custom') {
      const baseUrl = customBaseUrl || process.env.FIREBIRD_BASE_URL || 'https://api.firebird.ai/v1';
      const apiKey = customApiKey || process.env.FIREBIRD_API_KEY || 'default-token';
      try {
        resultText = await queryOpenAICompatible(
          baseUrl,
          apiKey,
          customModel || 'firebird-edu-v1',
          [
            { role: 'system', content: armenianSystemContext },
            { role: 'user', content: prompt },
          ]
        );
      } catch (err: any) {
        // If external custom/firebird endpoint is unreachable, fallback to server-side Gemini gracefully
        console.warn(`Firebird endpoint call failed (${err.message}). Falling back to Gemini.`);
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `${armenianSystemContext}\n\n[Firebird fallback execution via Gemini 3.8 Flash]\n\n${prompt}`,
          });
          resultText = response.text || '';
        } catch (geminiErr: any) {
          throw new Error(`Firebird error: ${err.message} and fallback error: ${geminiErr.message}`);
        }
      }
    } else {
      // Default: Gemini API using @google/genai and gemini-3.8-flash
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${armenianSystemContext}\n\n${prompt}`,
      });
      resultText = response.text || '';
    }

    res.json({
      success: true,
      provider,
      result: resultText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during AI generation',
    });
  }
});

// Test AI Provider connectivity
app.post('/api/ai/test-provider', async (req: Request, res: Response) => {
  try {
    const { provider, customApiKey, customBaseUrl, customModel } = req.body;
    let message = '';

    if (provider === 'gemini') {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Հաստատեք կապը: Պատասխանեք 1 նախադասությամբ հայերեն՝ "Կապը ՀՀ ԿԳՄՍՆ կրթական սերվերի հետ հաջողությամբ հաստատված է:"',
      });
      message = response.text || 'Gemini Connected';
    } else if (provider === 'openai') {
      const apiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'OpenAI API key missing' });
      }
      message = await queryOpenAICompatible('https://api.openai.com/v1', apiKey, customModel || 'gpt-4o-mini', [
        { role: 'user', content: 'Connection test for Armenia EduOS. Answer in one sentence.' },
      ]);
    } else {
      // Firebird or custom
      const baseUrl = customBaseUrl || process.env.FIREBIRD_BASE_URL || 'https://api.firebird.ai/v1';
      const apiKey = customApiKey || process.env.FIREBIRD_API_KEY || 'test-token';
      message = await queryOpenAICompatible(baseUrl, apiKey, customModel || 'firebird-edu-v1', [
        { role: 'user', content: 'Connection test for Firebird Educational API.' },
      ]);
    }

    res.json({ success: true, message });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Armenia EduOS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
