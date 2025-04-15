import { create } from "zustand";
import { Conversation } from "@/types";
import { conversationService } from "@/services/conversation-service";

interface ConversationsState {
  conversations: Conversation[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  fetchConversations: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (conversationId: string, type: "USER" | "GROUP") => Promise<void>;
  markMessageAsRead: (
    messageId: string,
    conversationId: string,
    type: "USER" | "GROUP",
  ) => Promise<void>;
  markMessageAsUnread: (
    messageId: string,
    conversationId: string,
    type: "USER" | "GROUP",
  ) => Promise<void>;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  clearConversations: () => void;
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: [],
  totalCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  fetchConversations: async (page = 1, limit = 20) => {
    try {
      set({ loading: true, error: null });

      const result = await conversationService.getConversations(page, limit);

      if (result) {
        const { conversations, totalCount } = result;

        // Determine if there are more conversations to load
        const hasMore = page * limit < totalCount;

        if (page === 1) {
          // Replace all conversations if it's the first page
          set({
            conversations,
            totalCount,
            currentPage: page,
            hasMore,
          });
        } else {
          // Append conversations for pagination
          set((state) => ({
            conversations: [...state.conversations, ...conversations],
            totalCount,
            currentPage: page,
            hasMore,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ error: "Không thể tải danh sách cuộc trò chuyện" });
    } finally {
      set({ loading: false });
    }
  },

  updateConversation: (id, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv,
      ),
    }));
  },

  addConversation: (conversation) => {
    set((state) => {
      // Check if conversation already exists
      const exists = state.conversations.some(
        (conv) => conv.id === conversation.id,
      );

      if (exists) {
        // Update existing conversation
        return {
          conversations: state.conversations.map((conv) =>
            conv.id === conversation.id ? { ...conv, ...conversation } : conv,
          ),
        };
      } else {
        // Add new conversation at the beginning of the list
        return {
          conversations: [conversation, ...state.conversations],
          totalCount: state.totalCount + 1,
        };
      }
    });
  },

  removeConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      totalCount: state.totalCount - 1,
    }));
  },

  clearConversations: () => {
    set({ conversations: [], totalCount: 0, currentPage: 1, hasMore: true });
  },

  markAsRead: async (conversationId, type) => {
    try {
      // Tìm cuộc trò chuyện phù hợp
      const state = get();
      const conversation = state.conversations.find((conv) => {
        if (type === "USER" && conv.type === "USER") {
          return conv.user?.id === conversationId;
        } else if (type === "GROUP" && conv.type === "GROUP") {
          return conv.group?.id === conversationId;
        }
        return false;
      });

      // Nếu có tin nhắn cuối cùng, đánh dấu nó là đã đọc
      if (conversation?.lastMessage?.id) {
        await conversationService.markMessageAsRead(
          conversation.lastMessage.id,
        );

        // Nếu có nhiều tin nhắn chưa đọc, có thể đánh dấu tất cả là đã đọc
        // Bạn có thể cần lấy danh sách tin nhắn chưa đọc và đánh dấu từng tin
      }

      // Cập nhật trạng thái local
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          // Tìm cuộc trò chuyện phù hợp dựa trên ID và loại
          const isMatch =
            (type === "USER" &&
              conv.type === "USER" &&
              conv.user?.id === conversationId) ||
            (type === "GROUP" &&
              conv.type === "GROUP" &&
              conv.group?.id === conversationId);

          return isMatch ? { ...conv, unreadCount: 0 } : conv;
        }),
      }));
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  },

  // Đánh dấu một tin nhắn cụ thể là đã đọc
  markMessageAsRead: async (messageId, conversationId, type) => {
    try {
      await conversationService.markMessageAsRead(messageId);

      // Cập nhật trạng thái local nếu cần
      // Nếu đây là tin nhắn cuối cùng trong cuộc trò chuyện, có thể cập nhật unreadCount
      set((state) => {
        const conversation = state.conversations.find((conv) => {
          if (type === "USER" && conv.type === "USER") {
            return conv.user?.id === conversationId;
          } else if (type === "GROUP" && conv.type === "GROUP") {
            return conv.group?.id === conversationId;
          }
          return false;
        });

        if (conversation?.lastMessage?.id === messageId) {
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === conversation.id
                ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) }
                : conv,
            ),
          };
        }

        return state; // Không thay đổi nếu không phải tin nhắn cuối cùng
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },

  // Đánh dấu một tin nhắn cụ thể là chưa đọc
  markMessageAsUnread: async (messageId, conversationId, type) => {
    try {
      await conversationService.markMessageAsUnread(messageId);

      // Cập nhật trạng thái local
      set((state) => {
        const conversation = state.conversations.find((conv) => {
          if (type === "USER" && conv.type === "USER") {
            return conv.user?.id === conversationId;
          } else if (type === "GROUP" && conv.type === "GROUP") {
            return conv.group?.id === conversationId;
          }
          return false;
        });

        if (conversation) {
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === conversation.id
                ? { ...conv, unreadCount: conv.unreadCount + 1 }
                : conv,
            ),
          };
        }

        return state;
      });
    } catch (error) {
      console.error("Error marking message as unread:", error);
    }
  },
}));
