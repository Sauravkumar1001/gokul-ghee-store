import { z } from 'zod';

export const aiChatSchema = z.object({
  sessionId: z
    .string()
    .trim()
    .min(4, 'Valid chat session ID is required.')
    .max(120),
  message: z
    .string()
    .trim()
    .min(1, 'Please enter a message for GOKUL AI.')
    .max(1000, 'Message cannot exceed 1000 characters.'),
  language: z.enum(['en', 'hi', 'hinglish']).optional().default('en'),
});
