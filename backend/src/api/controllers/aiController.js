// backend/src/api/controllers/aiController.js
const http = require('http');
const AppError = require('../../utils/AppError');

const callOllama = (prompt) => new Promise((resolve, reject) => {
    const data = JSON.stringify({ model: 'mistral', prompt, stream: false });
    const req = http.request({
        hostname: process.env.OLLAMA_HOST || '127.0.0.1',
        port: parseInt(process.env.OLLAMA_PORT || '11434', 10),
        path: '/api/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
        timeout: 30000,
    }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                resolve(parsed.response || 'No response');
            } catch {
                reject(new Error('Invalid response from AI service'));
            }
        });
    });
    req.on('error', () => reject(new AppError('AI service unavailable.', 503)));
    req.on('timeout', () => { req.destroy(); reject(new AppError('AI service timeout.', 504)); });
    req.write(data);
    req.end();
});

const fallbackResponse = (message) => {
    const tips = [
        'Break your goal into smaller weekly milestones.',
        'Track progress consistently — even small updates build momentum.',
        'Review completed goals to identify what worked best for you.',
    ];
    return `I'm your GoalMaster assistant. ${tips.join(' ')}\n\nYou asked: "${message}"`;
};

exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) return next(new AppError('Message is required', 400));
        let response;
        try {
            response = await callOllama(`You are a helpful goal-tracking assistant. Keep responses concise.\n\nUser: ${message}\nAssistant:`);
        } catch {
            response = fallbackResponse(message);
        }
        res.json({ status: 'success', data: { response } });
    } catch (error) {
        next(error);
    }
};

exports.suggest = async (req, res, next) => {
    try {
        const { context } = req.body;
        const prompt = `Suggest 3 specific, actionable goals.${context ? `\nContext: ${context}` : ''}\nSuggestions:`;
        let suggestions;
        try {
            suggestions = await callOllama(prompt);
        } catch {
            suggestions = '1. Read 20 pages daily\n2. Save 10% of income\n3. Exercise 3 times per week';
        }
        res.json({ status: 'success', data: { suggestions } });
    } catch (error) {
        next(error);
    }
};
