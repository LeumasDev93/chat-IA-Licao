// hooks/useChatHistory.ts
import { MessageType } from '@/types';
import { useState, useEffect } from 'react';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<MessageType[]>([]);

  // Carrega o histórico do localStorage quando o componente monta
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Atualiza o localStorage sempre que o histórico muda
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const addMessage = (message: MessageType) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  return { chatHistory, addMessage, clearHistory };
};