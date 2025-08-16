/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useChatHistory.ts
import { useState, useEffect, useCallback } from "react";
import { MessageType } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatData {
  messages: MessageType[];
  title: string;
}

interface ChatHistoryState {
  [chatId: string]: ChatData;
}

export const useChatHistory = () => {
  const { t } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatHistoryState>({});
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o histórico do localStorage
  const loadChatHistory = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const savedHistory = localStorage.getItem("chat_history");
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setChatHistory(history);
        
        // Define o primeiro chat como ativo se não houver um selecionado
        const chatIds = Object.keys(history);
        if (chatIds.length > 0 && !currentChatId) {
          setCurrentChatId(chatIds[0]);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega histórico quando componente monta
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Salva histórico no localStorage
  const saveToLocalStorage = useCallback((history: ChatHistoryState) => {
    try {
      localStorage.setItem("chat_history", JSON.stringify(history));
    } catch (err: any) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  }, []);

  // Adiciona mensagem ao chat atual
  const addMessage = useCallback((chatId: string, message: MessageType) => {
    setChatHistory(prev => {
      const currentChat = prev[chatId];
      if (!currentChat) return prev;

      // Define título baseado na primeira mensagem do usuário
      let title = currentChat.title;
      if (message.sender === 'user' && (!title || title === t('new_conversation') || title === 'Nova conversa')) {
        // Gera um título mais inteligente baseado na mensagem
        const text = message.text.trim();
        if (text.length > 0) {
          // Se a mensagem for muito longa, pega apenas as primeiras palavras
          if (text.length > 30) {
            const words = text.split(' ').slice(0, 6).join(' ');
            title = words + (words.length < text.length ? '...' : '');
          } else {
            title = text;
          }
        } else {
          title = t('new_conversation');
        }
      }

      const updatedHistory = {
        ...prev,
        [chatId]: {
          ...currentChat,
          messages: [...currentChat.messages, message],
          title: title
        }
      };

      // Salva no localStorage
      saveToLocalStorage(updatedHistory);
      return updatedHistory;
    });
  }, [saveToLocalStorage]);

  // Cria novo chat
  const createNewChat = useCallback((): string => {
    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newChat: ChatData = {
      messages: [],
      title: t('new_conversation')
    };

    setChatHistory(prev => {
      const updatedHistory = {
        [newChatId]: newChat,
        ...prev
      };
      
      // Salva no localStorage
      saveToLocalStorage(updatedHistory);
      return updatedHistory;
    });

    setCurrentChatId(newChatId);
    return newChatId;
  }, [saveToLocalStorage]);

  // Atualiza título do chat
  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChatHistory(prev => {
      const currentChat = prev[chatId];
      if (!currentChat) return prev;

      const updatedHistory = {
        ...prev,
        [chatId]: {
          ...currentChat,
          title
        }
      };

      // Salva no localStorage
      saveToLocalStorage(updatedHistory);
      return updatedHistory;
    });
  }, [saveToLocalStorage]);

  // Deleta chat
  const deleteChat = useCallback((chatId: string) => {
    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[chatId];
      
      // Salva no localStorage
      saveToLocalStorage(newHistory);
      
      // Se deletar o chat atual, define um novo chat ativo
      if (currentChatId === chatId) {
        const remainingChats = Object.keys(newHistory);
        setCurrentChatId(remainingChats[0] || '');
      }
      
      return newHistory;
    });
  }, [currentChatId, saveToLocalStorage]);

  // Limpa mensagens do chat
  const clearChatMessages = useCallback((chatId: string) => {
    setChatHistory(prev => {
      const currentChat = prev[chatId];
      if (!currentChat) return prev;

      const updatedHistory = {
        ...prev,
        [chatId]: {
          ...currentChat,
          messages: []
        }
      };

      // Salva no localStorage
      saveToLocalStorage(updatedHistory);
      return updatedHistory;
    });
  }, [saveToLocalStorage]);

  return {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    updateChatTitle,
    clearChatMessages,
    setCurrentChatId,
    loadChatHistory,
    loading,
    error,
    currentMessages: chatHistory[currentChatId]?.messages || [],
    currentChat: chatHistory[currentChatId]
  };
};

