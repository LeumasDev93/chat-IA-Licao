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
  chatId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatHistoryState {
  [chatId: string]: ChatData;
}

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lessonContent?: string; // Conteúdo real da lição para a IA usar
  lastUpdated: string;
  expiresAt: string;
}