// frontend/app/src/services/aiService.ts
import api from './apiService';

export const aiService = {
  /**
   * Send a chat message to the AI assistant.
   * @param message - The user's message text
   */
  chat: (message: string) => api.post('/ai/chat', { message }),

  /**
   * Request AI-powered suggestions based on objectives context.
   * @param context - Optional context string (user's objectives data)
   */
  suggest: (context?: string) => api.post('/ai/suggest', { context }),
};
