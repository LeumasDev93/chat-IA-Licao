export type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
  parts: Array<{ text: string }>;
};

export interface ChatData {
  title: string;
  messages: MessageType[];
}

export interface ChatHistoryState {
  [chatId: string]: ChatData;
}

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lastUpdated: string;
  expiresAt: string;
}