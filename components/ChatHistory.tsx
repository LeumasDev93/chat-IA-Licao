/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Trash2,
  Edit3,
  MessageSquare,
  Clock,
  MoreVertical,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChatData } from "@/types";

interface ChatHistoryProps {
  chatHistory: Record<string, ChatData>;
  currentChatId: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateTitle: (chatId: string, title: string) => void;
  onCreateNewChat: () => void;
  loading?: boolean;
}

export default function ChatHistory({
  chatHistory,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onUpdateTitle,
  onCreateNewChat,
  loading = false,
}: ChatHistoryProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Filtra chats baseado no termo de busca
  const filteredChats = Object.entries(chatHistory).filter(([chatId, chat]) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.title.toLowerCase().includes(searchLower) ||
      chat.messages.some((msg: any) =>
        (msg.text || msg.content)?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Ordena por data de atualização (mais recente primeiro)
  const sortedChats = filteredChats.sort(([, a], [, b]) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  const handleEditTitle = (chatId: string, currentTitle: string) => {
    setEditingTitle(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = (chatId: string) => {
    if (editTitle.trim()) {
      onUpdateTitle(chatId, editTitle.trim());
    }
    setEditingTitle(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setEditTitle("");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, "HH:mm", { locale: ptBR });
      } else if (diffInHours < 168) {
        // 7 dias
        return format(date, "EEEE", { locale: ptBR });
      } else {
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch {
      return t("invalid_date");
    }
  };

  const getMessagePreview = (messages: any[]) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return t("no_messages");

    const content = lastMessage.text || lastMessage.content || "";
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const getMessageCount = (messages: any[]) => {
    return messages.length;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("conversation_history")}
          </h2>
          <button
            onClick={onCreateNewChat}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t("new_conversation")}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t("search_conversations")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm
              ? t("no_conversations_found")
              : t("no_conversations_yet")}
          </div>
        ) : (
          <div className="p-2">
            {sortedChats.map(([chatId, chat]) => (
              <div
                key={chatId}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chatId
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => onSelectChat(chatId)}
              >
                {/* Chat Item */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    {editingTitle === chatId ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(chatId);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTitle(chatId)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTitle(chatId, chat.title);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title={t("edit_title")}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(showMenu === chatId ? null : chatId);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title={t("more_options")}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {getMessagePreview(chat.messages)}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {getMessageCount(chat.messages)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(chat.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showMenu === chatId && (
                  <div className="absolute right-2 top-2 mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chatId);
                        setShowMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("delete_conversation")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {sortedChats.length}{" "}
          {sortedChats.length !== 1
            ? t("conversations_count_plural")
            : t("conversations_count")}
        </div>
      </div>
    </div>
  );
}
