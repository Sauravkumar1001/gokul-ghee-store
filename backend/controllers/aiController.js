import { Conversation } from '../models/Conversation.js';
import { processGokulAiChat } from '../services/gokulAiService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const chatWithGokulAi = asyncHandler(async (req, res) => {
  const { sessionId, message, language } = req.body;
  const result = await processGokulAiChat({
    sessionId,
    message,
    language: language || 'en',
    user: req.user || null,
  });

  res.status(200).json({
    success: true,
    sessionId: result.sessionId,
    reply: result.reply,
  });
});

export const getGokulAiHistory = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    sessionId: String(req.params.sessionId || '').trim(),
  }).lean();

  if (!conversation) {
    return res.status(200).json({ success: true, messages: [] });
  }

  if (
    conversation.user &&
    (!req.user || String(conversation.user) !== String(req.user._id))
  ) {
    throw new ApiError(403, 'You do not have permission to read this chat history.');
  }

  res.status(200).json({
    success: true,
    messages: conversation.messages || [],
  });
});
