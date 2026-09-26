import { ConversationService } from '../services/conversation.service.js';

export class ConversationController {
  static async createSession(req, res, next) {
    try {
      const result = await ConversationService.startSession();
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async postMessage(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'A valid "message" string is required in the request body.' });
      }

      const result = await ConversationService.processUserMessage(sessionId, message.trim());
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const result = await ConversationService.getSessionDetails(sessionId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async patchState(req, res, next) {
    try {
      const { sessionId } = req.params;
      const patch = req.body;
      const result = await ConversationService.updateDirectState(sessionId, patch);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}