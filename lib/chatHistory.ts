import { ChatData, MessageType } from '@/types';
import { generateUniqueId } from './utils';

// Função para verificar se estamos no lado do cliente
function isClientSide(): boolean {
  return typeof window !== 'undefined';
}

export class ChatHistoryService {
  private static instance: ChatHistoryService;

  private constructor() {}

  public static getInstance(): ChatHistoryService {
    if (!ChatHistoryService.instance) {
      ChatHistoryService.instance = new ChatHistoryService();
    }
    return ChatHistoryService.instance;
  }

  // Carregar histórico do usuário
  async loadUserHistory(userId: string): Promise<ChatData[]> {
    console.log('Carregando histórico para usuário:', userId);
    return this.loadFromLocalStorage(userId);
  }

  // Salvar chat
  async saveChat(userId: string, chatData: ChatData): Promise<boolean> {
    console.log('Salvando chat para usuário:', userId);
    return this.saveToLocalStorage(chatData, userId);
  }

  // Atualizar título do chat
  async updateChatTitle(userId: string, chatId: string, title: string): Promise<boolean> {
    console.log('Atualizando título para usuário:', userId);
    return this.updateTitleInLocalStorage(chatId, title, userId);
  }

  // Deletar chat
  async deleteChat(userId: string, chatId: string): Promise<boolean> {
    console.log('Deletando chat para usuário:', userId);
    return this.deleteFromLocalStorage(chatId, userId);
  }

  // Adicionar mensagem ao chat
  async addMessage(userId: string, chatId: string, message: MessageType): Promise<boolean> {
    console.log('Adicionando mensagem para usuário:', userId);
    return this.addMessageToLocalStorage(chatId, message, userId);
  }

  // Métodos de localStorage
  private loadFromLocalStorage(userId: string): ChatData[] {
    if (!isClientSide()) {
      console.log('Não estamos no lado do cliente, retornando array vazio');
      return [];
    }

    try {
      const savedHistory = localStorage.getItem("chat_history");
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // Filtrar apenas chats do usuário específico
        return Object.entries(history)
          .filter(([, chatData]) => {
            const data = chatData as { userId?: string };
            return data.userId === userId;
          })
                     .map(([chatId, chatData]) => {
             const data = chatData as { title?: string; messages?: MessageType[] };
             const result = {
               title: data.title || 'Nova conversa',
               messages: data.messages || [],
               chatId
             };
             console.log('Carregando chat do localStorage:', chatId, 'com título:', result.title);
             return result;
           });
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    return [];
  }

  private saveToLocalStorage(chatData: ChatData, userId: string): boolean {
    if (!isClientSide()) {
      console.log('Não estamos no lado do cliente, não é possível salvar no localStorage');
      return false;
    }

    try {
      const savedHistory = localStorage.getItem("chat_history");
      const history = savedHistory ? JSON.parse(savedHistory) : {};
      
      const chatId = chatData.chatId || generateUniqueId("chat");
      history[chatId] = {
        title: chatData.title,
        messages: chatData.messages,
        userId: userId
      };
      
      console.log('Salvando chat no localStorage com título:', chatData.title);
      localStorage.setItem("chat_history", JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  }

  private updateTitleInLocalStorage(chatId: string, title: string, userId: string): boolean {
    if (!isClientSide()) {
      return false;
    }

    try {
      const savedHistory = localStorage.getItem("chat_history");
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        if (history[chatId] && history[chatId].userId === userId) {
          history[chatId].title = title;
          localStorage.setItem("chat_history", JSON.stringify(history));
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar título no localStorage:', error);
    }
    return false;
  }

  private deleteFromLocalStorage(chatId: string, userId: string): boolean {
    if (!isClientSide()) {
      return false;
    }

    try {
      const savedHistory = localStorage.getItem("chat_history");
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        if (history[chatId] && history[chatId].userId === userId) {
          delete history[chatId];
          localStorage.setItem("chat_history", JSON.stringify(history));
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao deletar do localStorage:', error);
    }
    return false;
  }

  private addMessageToLocalStorage(chatId: string, message: MessageType, userId: string): boolean {
    if (!isClientSide()) {
      return false;
    }

    try {
      const savedHistory = localStorage.getItem("chat_history");
      const history = savedHistory ? JSON.parse(savedHistory) : {};
      
      if (!history[chatId]) {
        history[chatId] = {
          title: 'Nova conversa',
          messages: [],
          userId: userId
        };
        console.log('Chat criado no localStorage com título:', history[chatId].title);
      }
      
      // Verificar se o chat pertence ao usuário
      if (history[chatId].userId === userId) {
        // Verifica se a mensagem já existe para evitar duplicação
        const messageExists = history[chatId].messages.some((msg: MessageType) => msg.id === message.id);
        if (!messageExists) {
          history[chatId].messages.push(message);
          
          // Atualiza o título se for a primeira mensagem do usuário
          if (message.sender === 'user' && (!history[chatId].title || history[chatId].title === 'Nova conversa' || history[chatId].title === 'New conversation')) {
            const text = message.text.trim();
            if (text.length > 0) {
              if (text.length > 30) {
                const words = text.split(' ').slice(0, 6).join(' ');
                history[chatId].title = words + (words.length < text.length ? '...' : '');
              } else {
                history[chatId].title = text;
              }
              console.log('Título atualizado para:', history[chatId].title);
            }
          }
          
          localStorage.setItem("chat_history", JSON.stringify(history));
        }
        return true;
      }
    } catch (error) {
      console.error('Erro ao adicionar mensagem no localStorage:', error);
    }
    return false;
  }
}

export const chatHistoryService = ChatHistoryService.getInstance();
