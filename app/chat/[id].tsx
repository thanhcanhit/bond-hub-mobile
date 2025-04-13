import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import uuid from "react-native-uuid";
import { VStack } from "@/components/ui/vstack";
import {
  Image as ImageIcon,
  Mic,
  Ellipsis,
  SendHorizonal,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sticker from "@/assets/svgs/sticker.svg";
import { Colors } from "@/constants/Colors";
import { useSocketContext } from "@/components/SocketProvider";
import { useAuthStore } from "@/store/authStore";
import EmojiSelector from "react-native-emoji-selector";
import { messageService } from "@/services/message-service";
import { MediaUploadFile, Message, MessageReaction } from "@/types";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ChatHeader } from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";

const ChatScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();
  const chatId = params.id as string;
  const { messageSocket } = useSocketContext();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isGroup] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const insets = useSafeAreaInsets();

  const shouldAutoScroll = useRef(true);

  const handleMediaUpload = async () => {
    if (!user) return;
    const tempId = uuid.v4();

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsLoadingMedia(true);

        // Kiểm tra kích thước file
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const invalidFiles = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > MAX_FILE_SIZE,
        );

        if (invalidFiles.length > 0) {
          Alert.alert("File quá lớn", "Ảnh hoặc video phải nhỏ hơn 10MB.");
          return;
        }

        // Tạo tin nhắn tạm thời để hiển thị ngay
        const tempMessage: Message = {
          id: tempId,
          content: {
            text: message,
            media: result.assets.map((asset) => ({
              type: asset.type === "video" ? "VIDEO" : "IMAGE",
              url: asset.uri,
              loading: true,
              width: asset.width,
              height: asset.height,
            })),
          },
          senderId: user.userId,
          receiverId: chatId,
          readBy: [],
          deletedBy: [],
          reactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMe: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        scrollToBottom();
        setMessage("");

        // Create FormData with message details and files
        const formData = new FormData();
        formData.append("receiverId", chatId);
        formData.append("content[text]", message);

        result.assets.forEach((asset) => {
          const fileType = asset.type === "video" ? "video/mp4" : "image/jpeg";
          const mediaType = asset.type === "video" ? "VIDEO" : "IMAGE";
          formData.append("mediaType", mediaType);
          formData.append("files", {
            uri: asset.uri,
            type: fileType,
            name: `${asset.type === "video" ? "video" : "image"}_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
            mediaType: mediaType,
          } as any);
        });

        try {
          const response = await messageService.sendMediaMessage(formData);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? ({ ...response, isMe: true } as Message)
                : msg,
            ),
          );
        } catch (error: any) {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          Alert.alert("Lỗi", "Không thể gửi file. Vui lòng thử lại.");
          console.error("Media upload error:", error);
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
      console.error("Media picker error:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      if (shouldAutoScroll.current && scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated });
      }
    }, 100);
  };

  // Xử lý khi scroll manually
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Nếu scroll gần cuối (trong khoảng 20px) thì cho phép auto scroll
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    shouldAutoScroll.current = isCloseToBottom;

    // Load more khi scroll lên trên
    if (contentOffset.y <= 20 && hasMore && !loading) {
      handleLoadMore();
    }
  };

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, [chatId]);

  const setupSocketListeners = () => {
    if (!messageSocket) return;

    messageSocket.on("new_message", handleNewMessage);
    messageSocket.on("message_reaction", handleMessageReaction);
    messageSocket.on("message_recall", handleMessageRecall);
    messageSocket.on("message_delete", handleMessageDelete);
  };

  const cleanupSocketListeners = () => {
    if (!messageSocket) return;

    messageSocket.off("new_message");
    messageSocket.off("message_reaction");
    messageSocket.off("message_recall");
    messageSocket.off("message_delete");
  };

  const handleNewMessage = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]); // Thêm tin nhắn mới vào cuối
    scrollToBottom(); // Scroll to bottom when new message arrives
  };

  const handleMessageReaction = (data: {
    messageId: string;
    reaction: MessageReaction;
  }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId
          ? {
              ...msg,
              reactions: [...(msg.reactions || []), data.reaction],
            }
          : msg,
      ),
    );
  };

  const handleMessageRecall = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, recalled: true } : msg,
      ),
    );
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const loadMessages = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await messageService.getMessageHistory(chatId, pageNum);
      if (!data || data.length < 20) {
        setHasMore(false);
      }
      if (pageNum === 1) {
        setMessages(data?.reverse() || []);
        scrollToBottom(false); // Scroll to bottom without animation on first load
      } else {
        setMessages((prev) => [...(data?.reverse() || []), ...prev]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(1);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    await loadMessages(page + 1);
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    const tempId = uuid.v4();
    try {
      const tempMessage: Message = {
        id: tempId,
        content: { text: message },
        senderId: user.userId,
        receiverId: chatId,
        readBy: [],
        deletedBy: [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMe: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");
      scrollToBottom();

      const response = await messageService.sendMessage({
        receiverId: chatId,
        content: { text: message },
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? ({ ...response, isMe: true } as Message)
            : msg,
        ),
      );
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const handleDocumentPick = async () => {
    if (!user) return;
    const tempId = uuid.v4();

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        multiple: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsLoadingMedia(true);

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const invalidFiles = result.assets.filter(
          (asset) => asset.size && asset.size > MAX_FILE_SIZE,
        );

        if (invalidFiles.length > 0) {
          Alert.alert("File Too Large", "Documents must be under 5MB.");
          return;
        }

        const tempMessage: Message = {
          id: tempId,
          content: {
            text: message,
            media: result.assets.map((asset) => ({
              type: "DOCUMENT",
              url: asset.uri,
              name: asset.name,
              loading: true,
            })),
          },
          senderId: user.userId,
          receiverId: chatId,
          readBy: [],
          deletedBy: [],
          reactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMe: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        scrollToBottom();
        setMessage("");
        const formData = new FormData();
        formData.append("receiverId", chatId);
        formData.append("content[text]", message);
        result.assets.map((asset) => {
          formData.append("mediaType", "DOCUMENT");
          formData.append("files", {
            uri: asset.uri,
            type: asset.mimeType || "application/octet-stream",
            name: asset.name,
            mediaType: "DOCUMENT",
          } as any);
        });

        try {
          const response = await messageService.sendMediaMessage(formData);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? ({ ...response, isMe: true } as Message)
                : msg,
            ),
          );

          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        } catch (error: any) {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          Alert.alert("Error", "Failed to upload document. Please try again.");
          console.error("Document upload error:", error);
        }
      }
    } catch (error: any) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      Alert.alert("Error", "Failed to upload document. Please try again.");
      console.error("Document upload error:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };
  const handleReaction = async (messageId: string, reactionType: string) => {
    try {
      await messageService.addReaction(messageId, reactionType);
    } catch (error) {
      console.error("Error adding reaction:", error);
      Alert.alert("Error", "Failed to add reaction");
    }
  };

  const handleRecall = async (messageId: string) => {
    try {
      await messageService.recallMessage(messageId);
    } catch (error) {
      console.error("Error recalling message:", error);
      Alert.alert("Error", "Failed to recall message");
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Failed to delete message");
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ChatHeader
        chatId={chatId}
        isGroup={isGroup}
        onBack={() => router.back()}
      />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {loading && <ActivityIndicator className="py-4" />}
        <VStack className="py-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onReaction={handleReaction}
              onRecall={handleRecall}
              onDelete={handleDelete}
            />
          ))}
        </VStack>
      </ScrollView>

      {showEmoji && (
        <EmojiSelector
          showHistory
          columns={10}
          theme="transparent"
          onEmojiSelected={(emoji) => {
            setMessage((prev) => prev + emoji);
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View
          className="flex-row justify-center items-center bg-white px-4 pt-4 "
          style={{ paddingBottom: insets.bottom }}
        >
          <TouchableOpacity
            className="ml-2.5"
            onPress={() => setShowEmoji(!showEmoji)}
            disabled={isLoadingMedia}
          >
            <Sticker width={24} height={24} color={"#c4c4c4"} />
          </TouchableOpacity>

          <TextInput
            className="flex-1 ml-2.5 p-1 h-full bg-transparent justify-center text-gray-700 text-base "
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          {!message.trim() ? (
            <View className="flex-row">
              <TouchableOpacity className="mx-2" disabled={isLoadingMedia}>
                <Mic
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="mx-2"
                onPress={handleMediaUpload}
                disabled={isLoadingMedia}
              >
                <ImageIcon
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="mx-2"
                onPress={handleDocumentPick}
                disabled={isLoadingMedia}
              >
                <Ellipsis
                  size={26}
                  color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!message.trim() || isLoadingMedia}
            >
              <SendHorizonal size={28} fill={Colors.light.PRIMARY_BLUE} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
