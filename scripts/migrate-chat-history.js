// Script para migrar dados de chat do localStorage para o Supabase
// Execute este script no navegador quando o usuário estiver logado

import { createComponentClient } from '@/models/supabase';
import { chatHistoryService } from '@/lib/chatHistory';

export async function migrateChatHistory() {
  try {
    console.log('Iniciando migração do histórico de chat...');
    
    const supabase = createComponentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Buscar dados do localStorage
    const savedHistory = localStorage.getItem("chat_history");
    if (!savedHistory) {
      console.log('Nenhum histórico encontrado no localStorage');
      return { success: true, message: 'Nenhum histórico para migrar' };
    }

    const history = JSON.parse(savedHistory);
    const chatIds = Object.keys(history);
    
    console.log(`Encontrados ${chatIds.length} chats para migrar`);

    let migratedCount = 0;
    let errorCount = 0;

    // Migrar cada chat
    for (const chatId of chatIds) {
      try {
        const chatData = history[chatId];
        
        const chatToSave = {
          title: chatData.title || 'Nova conversa',
          messages: chatData.messages || [],
          chatId: chatId
        };

        const success = await chatHistoryService.saveChat(user.id, chatToSave);
        
        if (success) {
          migratedCount++;
          console.log(`Chat ${chatId} migrado com sucesso`);
        } else {
          errorCount++;
          console.error(`Erro ao migrar chat ${chatId}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Erro ao migrar chat ${chatId}:`, error);
      }
    }

    // Limpar localStorage após migração bem-sucedida
    if (migratedCount > 0 && errorCount === 0) {
      localStorage.removeItem("chat_history");
      console.log('localStorage limpo após migração bem-sucedida');
    }

    return {
      success: true,
      migratedCount,
      errorCount,
      message: `Migração concluída: ${migratedCount} chats migrados, ${errorCount} erros`
    };

  } catch (error) {
    console.error('Erro durante migração:', error);
    return { success: false, error: error.message };
  }
}

// Função para verificar se há dados para migrar
export function hasLocalStorageData() {
  try {
    const savedHistory = localStorage.getItem("chat_history");
    if (!savedHistory) return false;
    
    const history = JSON.parse(savedHistory);
    return Object.keys(history).length > 0;
  } catch {
    return false;
  }
}

// Função para mostrar prompt de migração
export function showMigrationPrompt() {
  if (typeof window === 'undefined') return;
  
  if (hasLocalStorageData()) {
    const shouldMigrate = confirm(
      'Encontramos dados de chat salvos localmente. Deseja migrar para o servidor para acessá-los em qualquer dispositivo?'
    );
    
    if (shouldMigrate) {
      migrateChatHistory().then(result => {
        if (result.success) {
          alert(`Migração concluída: ${result.migratedCount} chats migrados`);
          // Recarregar a página para atualizar o histórico
          window.location.reload();
        } else {
          alert(`Erro na migração: ${result.error}`);
        }
      });
    }
  }
}
