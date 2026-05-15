// backend/src/api/controllers/aiController.js
const http = require('http');
const AppError = require('../../utils/AppError');

const callOllama = (prompt) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: 'mistral',
            prompt: prompt,
            stream: false
        });

        const req = http.request({
            hostname: '127.0.0.1',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve(parsed.response || 'No response');
                } catch {
                    reject(new Error('Invalid response from Ollama'));
                }
            });
        });

        req.on('error', () => reject(new AppError('AI service unavailable. Is Ollama running?', 503)));
        req.write(data);
        req.end();
    });
};

exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return next(new AppError('Message is required', 400));
        const response = await callOllama(`You are a helpful goal-tracking assistant. Keep responses concise and practical.\n\nUser: ${message}\nAssistant:`);
        res.json({ status: 'success', data: { response } });
    } catch (error) {
        next(error);
    }
};

exports.suggest = async (req, res, next) => {
    try {
        const { context } = req.body;
        const prompt = `Based on the user's goal tracking data, suggest 3 new goals or improvements. Keep suggestions specific and actionable.${context ? `\nContext: ${context}` : ''}\nSuggestions:`;
        const response = await callOllama(prompt);
        res.json({ status: 'success', data: { suggestions: response } });
    } catch (error) {
        next(error);
    }
};
