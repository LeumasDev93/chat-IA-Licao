// hooks/useChatHistory.ts
import { useState, useEffect } from "react";
import { MessageType } from "@/types";

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<Record<string, MessageType[]>>({});
  const [currentChatId, setCurrentChatId] = useState<string>("");

  // Carrega o histórico do localStorage quando o componente monta
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    // Cria uma nova conversa por padrão
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
  }, []);

  // Salva no localStorage sempre que o histórico muda
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const addMessage = (chatId: string, message: MessageType) => {
    setChatHistory(prev => {
      const currentChat = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [...currentChat, message]
      };
    });
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[chatId];
      return newHistory;
    });
  };

  return {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    setCurrentChatId
  };
};