/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useChatHistory.ts
import { useState, useEffect, useCallback } from "react";
import { MessageType, ChatData } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatHistoryService } from "@/lib/chatHistory";
import { generateUniqueId } from "@/lib/utils";

interface ChatHistoryState {
  [chatId: string]: ChatData;
}

export const useChatHistory = (userId?: string) => {
  const { t } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatHistoryState>({});
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o histórico do usuário
  const loadChatHistory = useCallback(async () => {
    if (!userId) {
      setChatHistory({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userHistory = await chatHistoryService.loadUserHistory(userId);
      
      // Converter array para objeto
      const historyObj: ChatHistoryState = {};
      userHistory.forEach(chat => {
        if (chat.chatId) {
          historyObj[chat.chatId] = chat;
        }
      });
      
      setChatHistory(historyObj);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Removido currentChatId para evitar loop

  // Carrega histórico quando componente monta ou userId muda
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Define o primeiro chat como ativo quando o histórico for carregado
  useEffect(() => {
    const chatIds = Object.keys(chatHistory);
    if (chatIds.length > 0 && !currentChatId) {
      setCurrentChatId(chatIds[0]);
    }
  }, [chatHistory]); // Removido currentChatId para evitar loop

  // Adiciona mensagem ao chat atual
  const addMessage = useCallback(async (chatId: string, message: MessageType) => {
    if (!userId) return;

    setChatHistory(prev => {
      let currentChat = prev[chatId];
      
      // Se o chat não existe, cria um novo
      if (!currentChat) {
        currentChat = {
          messages: [],
          title: t('new_conversation'),
          chatId: chatId
        };
      }

      // Verifica se a mensagem já existe para evitar duplicação
      const messageExists = currentChat.messages.some(msg => msg.id === message.id);
      if (messageExists) {
        return prev;
      }

      // Define título baseado na primeira mensagem do usuário
      let title = currentChat.title;
      if (message.sender === 'user' && (!title || title === t('new_conversation') || title === 'Nova conversa' || title === 'New conversation')) {
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

      // Salva usando o service (sem aguardar para não bloquear a UI)
      chatHistoryService.addMessage(userId, chatId, message).catch(console.error);
      
      // Se o título mudou, atualiza também
      if (title !== currentChat.title) {
        chatHistoryService.updateChatTitle(userId, chatId, title).catch(console.error);
      }
      
      return updatedHistory;
    });
  }, [userId, t]);

  // Cria novo chat
  const createNewChat = useCallback(async (): Promise<string> => {
    if (!userId) return "";

    const newChatId = generateUniqueId("chat");
    
    const newChat: ChatData = {
      messages: [],
      title: t('new_conversation'),
      chatId: newChatId
    };

    // Salva usando o service
    await chatHistoryService.saveChat(userId, newChat);

    setChatHistory(prev => ({
      [newChatId]: newChat,
      ...prev
    }));

    setCurrentChatId(newChatId);
    console.log('Novo chat criado com ID:', newChatId, 'e título:', newChat.title);
    return newChatId;
  }, [userId, t]);

  // Atualiza título do chat
  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    if (!userId) return;

    // Salva usando o service
    await chatHistoryService.updateChatTitle(userId, chatId, title);

    setChatHistory(prev => {
      const currentChat = prev[chatId];
      if (!currentChat) return prev;

      return {
        ...prev,
        [chatId]: {
          ...currentChat,
          title
        }
      };
    });
  }, [userId]);

  // Deleta chat
  const deleteChat = useCallback(async (chatId: string) => {
    if (!userId) return;

    // Deleta usando o service
    await chatHistoryService.deleteChat(userId, chatId);

    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[chatId];
      
      // Se deletar o chat atual, define um novo chat ativo
      if (currentChatId === chatId) {
        const remainingChats = Object.keys(newHistory);
        setCurrentChatId(remainingChats[0] || '');
      }
      
      return newHistory;
    });
  }, [userId, currentChatId]);

  // Limpa mensagens do chat
  const clearChatMessages = useCallback(async (chatId: string) => {
    if (!userId) return;

    setChatHistory(prev => {
      const currentChat = prev[chatId];
      if (!currentChat) return prev;

      return {
        ...prev,
        [chatId]: {
          ...currentChat,
          messages: []
        }
      };
    });
  }, [userId]);

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

