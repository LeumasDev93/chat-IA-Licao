/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useChatHistory.ts
import { useState, useEffect, useCallback } from "react";
import { MessageType } from "@/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export const useChatHistory = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [chatHistory, setChatHistory] = useState<Record<string, MessageType[]>>({});
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o histórico e configura realtime
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let subscription: any;

    const loadAndSubscribe = async () => {
      try {
        setLoading(true);
        
        // 1. Carrega chats existentes
        const { data: chats, error: fetchError } = await supabase
          .from('user_chats')
          .select('chat_id, messages, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const history: Record<string, MessageType[]> = {};
        chats?.forEach(chat => {
          history[chat.chat_id] = chat.messages || [];
        });

        setChatHistory(history);
        
        // Define o chat mais recente como ativo
        if (chats?.length) {
          setCurrentChatId(chats[0].chat_id);
        } else {
          const newChatId = await createNewChat();
          setCurrentChatId(newChatId);
        }

        // 2. Configura subscription para atualizações em tempo real
        subscription = supabase
          .channel('user_chats_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_chats',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              handleRealtimeUpdate(payload);
            }
          )
          .subscribe();

      } catch (err) {
        setError(error);
        console.error('Erro ao carregar chats:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newData, old } = payload;
      
      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          setChatHistory(prev => ({
            ...prev,
            [newData.chat_id]: newData.messages
          }));
          break;
        
        case 'DELETE':
          setChatHistory(prev => {
            const newHistory = { ...prev };
            delete newHistory[old.chat_id];
            return newHistory;
          });
          break;
      }
    };

    loadAndSubscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user, supabase]);

  // Salva alterações no Supabase com debounce
  useEffect(() => {
    if (!user || loading) return;

    const saveChanges = async () => {
      try {
        const updates = Object.entries(chatHistory).map(([chatId, messages]) => ({
          user_id: user.id,
          chat_id: chatId,
          messages,
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('user_chats')
          .upsert(updates, { onConflict: 'user_id,chat_id' });

        if (error) throw error;
      } catch (err) {
        console.error('Erro ao salvar chats:', err);
      }
    };

    const debounceTimer = setTimeout(saveChanges, 1000);
    return () => clearTimeout(debounceTimer);
  }, [chatHistory, user, supabase, loading]);

  const addMessage = useCallback(async (chatId: string, message: MessageType) => {
    setChatHistory(prev => {
      const currentChat = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [...currentChat, message]
      };
    });
  }, []);

  const createNewChat = useCallback(async () => {
    const newChatId = Date.now().toString();
    
    try {
      const { error } = await supabase
        .from('user_chats')
        .insert({
          user_id: user?.id,
          chat_id: newChatId,
          messages: [],
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setChatHistory(prev => ({
        ...prev,
        [newChatId]: []
      }));

      return newChatId;
    } catch (err) {
      console.error('Erro ao criar chat:', err);
      throw err;
    }
  }, [user, supabase]);

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_chats')
        .delete()
        .eq('user_id', user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      setChatHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[chatId];
        return newHistory;
      });

      // Se deletar o chat atual, define um novo chat ativo
      if (currentChatId === chatId) {
        const remainingChats = Object.keys(chatHistory).filter(id => id !== chatId);
        setCurrentChatId(remainingChats[0] || '');
      }
    } catch (err) {
      console.error('Erro ao deletar chat:', err);
    }
  }, [user, supabase, currentChatId, chatHistory]);

  return {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    setCurrentChatId,
    loading,
    error,
    currentMessages: chatHistory[currentChatId] || []
  };
};

