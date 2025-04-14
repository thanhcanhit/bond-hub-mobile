import { create } from "zustand";
import { Message, MessageReaction, ReactionType } from "@/types";
import { messageService } from "@/services/message-service";
import uuid from "react-native-uuid";
interface ChatState {
  messages: Message[];
  loading: boolean;
  refreshing: boolean;
  page: number;
  hasMore: boolean;
  isLoadingMedia: boolean;
  selectedMedia: Array<{
    uri: string;
    type: "IMAGE" | "VIDEO";
    width?: number;
    height?: number;
  }>;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updatedMessage: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMedia: (isLoading: boolean) => void;
  setSelectedMedia: (
    media: Array<{
      uri: string;
      type: "IMAGE" | "VIDEO";
      width?: number;
      height?: number;
    }>,
  ) => void;

  // Async actions
  loadMessages: (chatId: string, pageNum?: number) => Promise<void>;
  sendMessage: (chatId: string, text: string, userId: string) => Promise<void>;
  sendMediaMessage: (
    chatId: string,
    text: string,
    userId: string,
    media: any[],
  ) => Promise<void>;
  handleReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
  handleUnReaction: (messageId: string) => Promise<void>;
  handleRecall: (messageId: string) => Promise<void>;
  handleDelete: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  refreshing: false,
  page: 1,
  hasMore: true,
  isLoadingMedia: false,
  selectedMedia: [],

  // Basic actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateMessage: (messageId, updatedMessage) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg,
      ),
    })),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setPage: (page) => set({ page }),
  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoadingMedia: (isLoadingMedia) => set({ isLoadingMedia }),
  setSelectedMedia: (media) => set({ selectedMedia: media }),

  // Async actions
  loadMessages: async (chatId, pageNum = 1) => {
    const state = get();
    try {
      state.setLoading(true);
      const data = await messageService.getMessageHistory(chatId, pageNum);

      if (!data || data.length < 20) {
        state.setHasMore(false);
      }

      if (pageNum === 1) {
        state.setMessages(data?.reverse() || []);
      } else {
        state.setMessages([...(data?.reverse() || []), ...state.messages]);
      }

      state.setPage(pageNum);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      state.setLoading(false);
    }
  },

  sendMessage: async (chatId, text, userId) => {
    const state = get();
    const tempId = uuid.v4();
    const tempMessage: Message = {
      id: tempId,
      content: { text },
      senderId: userId,
      receiverId: chatId,
      readBy: [],
      deletedBy: [],
      reactions: [],
      messageType: "USER",
      isMe: true,
    };

    state.addMessage(tempMessage);

    try {
      const response = await messageService.sendMessage({
        receiverId: chatId,
        content: { text },
      });

      state.updateMessage(tempId, { ...response, isMe: true });
    } catch (error) {
      console.error("Error sending message:", error);
      state.removeMessage(tempId);
    }
  },

  sendMediaMessage: async (chatId, text, userId, media) => {
    const state = get();
    const tempId = uuid.v4();

    try {
      state.setIsLoadingMedia(true);

      const tempMessage: Message = {
        id: tempId,
        content: {
          text,
          media: media.map((m) => ({
            type: m.type,
            url: m.uri,
            loading: true,
          })),
        },
        senderId: userId,
        receiverId: chatId,
        readBy: [],
        deletedBy: [],
        reactions: [],
        messageType: "USER",
        isMe: true,
      };

      state.addMessage(tempMessage);

      const formData = new FormData();
      formData.append("receiverId", chatId);
      formData.append("content[text]", text);

      media.forEach((m) => {
        const fileType = m.type === "VIDEO" ? "video/mp4" : "image/jpeg";
        formData.append("mediaType", m.type);
        formData.append("files", {
          uri: m.uri,
          type: fileType,
          name: `${m.type.toLowerCase()}_${Date.now()}.${m.type === "VIDEO" ? "mp4" : "jpg"}`,
          mediaType: m.type,
        } as any);
      });

      const response = await messageService.sendMediaMessage(formData);
      state.updateMessage(tempId, { ...response, isMe: true });
      state.setSelectedMedia([]);
    } catch (error) {
      console.error("Media upload error:", error);
      state.removeMessage(tempId);
    } finally {
      state.setIsLoadingMedia(false);
    }
  },

  handleReaction: async (messageId, reaction) => {
    const state = get();
    try {
      await messageService.addReaction(messageId, reaction);
      state.updateMessage(messageId, {
        reactions: [
          ...(state.messages.find((m) => m.id === messageId)?.reactions || []),
          {
            userId:
              state.messages.find((m) => m.id === messageId)?.senderId || "",
            reaction,
            count: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  },

  handleUnReaction: async (messageId) => {
    const state = get();
    try {
      await messageService.removeReaction(messageId);
      const message = state.messages.find((m) => m.id === messageId);
      if (message) {
        state.updateMessage(messageId, {
          reactions: message.reactions?.filter(
            (r) => r.userId !== message.senderId,
          ),
        });
      }
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  },

  handleRecall: async (messageId) => {
    const state = get();
    try {
      await messageService.recallMessage(messageId);
      state.updateMessage(messageId, { recalled: true });
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  },

  handleDelete: async (messageId) => {
    const state = get();
    try {
      await messageService.deleteMessage(messageId);
      state.removeMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  },
}));
