// backend/src/api/controllers/aiController.js
const http = require('http');
const { URL } = require('url');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

/**
 * Call Ollama API for chat completion using the /api/chat endpoint.
 * Uses Node.js built-in http module — no extra dependencies.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<object>} The parsed Ollama response
 */
function callOllamaChat(messages) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/chat', OLLAMA_HOST);
    const data = JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse Ollama response: ' + e.message));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error('Ollama request failed: ' + err.message));
    });

    req.write(data);
    req.end();
  });
}

/**
 * POST /api/ai/chat
 * Sends a user message to Ollama and returns the model's response.
 */
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'A valid "message" field is required.',
      });
    }

    const result = await callOllamaChat([
      { role: 'user', content: message },
    ]);

    res.json({
      status: 'success',
      data: {
        response: result.message?.content || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/suggest
 * Sends the user's objectives data as context and returns AI-powered suggestions.
 */
exports.suggest = async (req, res, next) => {
  try {
    const { context } = req.body;

    const prompt = `Based on the following user objectives data, provide suggestions for improvement and goal prioritization:\n\n${context || 'No context provided'}\n\nProvide actionable suggestions in a concise format.`;

    const result = await callOllamaChat([
      {
        role: 'system',
        content: 'You are a helpful goal management assistant. Provide concise, actionable suggestions.',
      },
      { role: 'user', content: prompt },
    ]);

    res.json({
      status: 'success',
      data: {
        suggestions: result.message?.content || '',
      },
    });
  } catch (error) {
    next(error);
  }
};
