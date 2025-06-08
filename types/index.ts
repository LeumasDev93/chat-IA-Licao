export type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
  parts: Array<{ text: string }>;
};