import { Session } from '../models/Session.js';
import { Message } from '../models/Message.js';
import { StateService } from './state.service.js';
import { DocumentService } from './document.service.js';
import { getLLMService } from './llm/llm.factory.js';

export class ConversationService {
  static async startSession() {
    const session = await Session.create({ status: 'in_progress' });
    const state = await StateService.getOrCreateState(session._id);

    const initialGreeting = "Hello! I'm your intake assistant for the Personal Wishes Document. To get started, What is your full name?";
    
    await Message.create({
      sessionId: session._id,
      role: 'assistant',
      content: initialGreeting
    });

    const messages = await Message.find({ sessionId: session._id }).sort({ createdAt: 1 });
    const document = DocumentService.generateDocument(state);

    return {
      sessionId: session._id,
      assistantMessage: initialGreeting,
      state,
      document,
      messages
    };
  }

  static async processUserMessage(sessionId, userText) {
    const session = await Session.findById(sessionId);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    // 1. Record incoming user message
    await Message.create({
      sessionId,
      role: 'user',
      content: userText
    });

    // 2. Load current canonical state and conversation history
    const currentState = await StateService.getOrCreateState(sessionId);
    const recentMessages = await Message.find({ sessionId }).sort({ createdAt: 1 }).limit(20);

    // 3. Delegate extraction to LLM provider
    const llmService = getLLMService();
    const llmResult = await llmService.processMessage({
      currentState: currentState.toObject ? currentState.toObject() : currentState,
      recentMessages: recentMessages.map((m) => ({ role: m.role, content: m.content })),
      latestUserMessage: userText
    });

    // 4. Validate and apply state updates deterministically
    const mergedState = StateService.applyProposedUpdates(currentState, llmResult.updates);
    const savedState = await StateService.persistState(sessionId, mergedState);

    // 5. Determine assistant reply
    let assistantReply = llmResult.next_question;
    if (llmResult.clarification_needed && llmResult.clarification_question) {
      assistantReply = llmResult.clarification_question;
    }

    // 6. Record assistant reply
    await Message.create({
      sessionId,
      role: 'assistant',
      content: assistantReply
    });

    // 7. Deterministically render document from state
    const document = DocumentService.generateDocument(savedState);
    const allMessages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    return {
      assistantMessage: assistantReply,
      state: savedState,
      document,
      messages: allMessages,
      conflicts: llmResult.conflicts
    };
  }

  static async getSessionDetails(sessionId) {
    const session = await Session.findById(sessionId);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    const state = await StateService.getOrCreateState(sessionId);
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    const document = DocumentService.generateDocument(state);

    return {
      session,
      state,
      messages,
      document
    };
  }

  static async updateDirectState(sessionId, rawPatch) {
    const currentState = await StateService.getOrCreateState(sessionId);
    const mergedState = StateService.applyProposedUpdates(currentState, rawPatch);
    const savedState = await StateService.persistState(sessionId, mergedState);
    const document = DocumentService.generateDocument(savedState);

    return {
      state: savedState,
      document
    };
  }
}